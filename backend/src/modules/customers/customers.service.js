const prisma = require('../../prisma/client');
const { calculateCustomerBalance } = require('../../utils/balances');
const { normalizePhone, isValidMauritanianPhone } = require('../../utils/phones');

class CustomersService {
  /**
   * Get all active customers for a shop
   */
  async getAllCustomers(shopId) {
    const customers = await prisma.customer.findMany({
      where: {
        shopId,
        deletedAt: null, // Exclude soft-deleted customers
      },
      include: {
        transactions: {
          select: {
            amount: true,
            type: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return customers.map((cust) => {
      const balance = calculateCustomerBalance(cust.transactions);
      // Remove raw transactions to keep response lightweight
      const { transactions, ...customerData } = cust;
      return {
        ...customerData,
        balance,
      };
    });
  }

  /**
   * Get a single customer by ID, verified to belong to the shop
   */
  async getCustomerById(shopId, customerId) {
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        shopId,
        deletedAt: null,
      },
      include: {
        transactions: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!customer) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      throw error;
    }

    const balance = calculateCustomerBalance(customer.transactions);
    
    return {
      ...customer,
      balance,
    };
  }

  /**
   * Create a new customer under the current shop context
   */
  async createCustomer(shopId, customerData) {
    const { name, phone } = customerData;
    const normalizedPhone = phone ? normalizePhone(phone) : null;

    if (normalizedPhone && !isValidMauritanianPhone(normalizedPhone)) {
      const error = new Error('Customer phone must be a valid Mauritanian 8-digit number');
      error.statusCode = 400;
      throw error;
    }
    
    return prisma.customer.create({
      data: {
        shopId,
        name,
        phone: normalizedPhone,
      },
    });
  }

  /**
   * Update customer details
   */
  async updateCustomer(shopId, customerId, updateData) {
    // Verify customer exists and belongs to the shop
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        shopId,
        deletedAt: null,
      },
    });

    if (!customer) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      throw error;
    }

    const normalizedPhone = updateData.phone ? normalizePhone(updateData.phone) : updateData.phone;

    if (normalizedPhone && !isValidMauritanianPhone(normalizedPhone)) {
      const error = new Error('Customer phone must be a valid Mauritanian 8-digit number');
      error.statusCode = 400;
      throw error;
    }

    return prisma.customer.update({
      where: {
        id: customerId,
      },
      data: {
        name: updateData.name,
        phone: normalizedPhone,
      },
    });
  }

  /**
   * Soft-delete customer.
   */
  async deleteCustomer(shopId, customerId) {
    // Verify customer exists and belongs to the shop
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        shopId,
        deletedAt: null,
      },
    });

    if (!customer) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      throw error;
    }

    // Set deletedAt to mark as soft-deleted
    return prisma.customer.update({
      where: {
        id: customerId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

module.exports = new CustomersService();
