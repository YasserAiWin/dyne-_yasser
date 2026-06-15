const prisma = require('../../prisma/client');

class TransactionsService {
  /**
   * List transactions for a customer, verifying ownership first
   */
  async getCustomerTransactions(shopId, customerId) {
    // 1. Verify customer exists, belongs to the shop, and is active
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        shopId,
        deletedAt: null,
      },
    });

    if (!customer) {
      const error = new Error('Customer not found or access denied');
      error.statusCode = 404;
      throw error;
    }

    // 2. Fetch transactions
    return prisma.transaction.findMany({
      where: {
        customerId,
        shopId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Create a debt or payment transaction, verifying ownership first
   */
  async createTransaction(shopId, customerId, type, txData, createdById) {
    const { amount, note, itemsJson } = txData;

    if (parseFloat(amount) <= 0) {
      const error = new Error('Transaction amount must be strictly positive');
      error.statusCode = 400;
      throw error;
    }

    // Run verification and insertion inside a transaction for complete safety
    return prisma.$transaction(async (tx) => {
      // 1. Verify customer exists, belongs to the shop, and is active
      const customer = await tx.customer.findFirst({
        where: {
          id: customerId,
          shopId,
          deletedAt: null,
        },
      });

      if (!customer) {
        const error = new Error('Customer not found or access denied');
        error.statusCode = 404;
        throw error;
      }

      // 2. Create the transaction
      return tx.transaction.create({
        data: {
          shopId,
          customerId,
          type,
          amount,
          note,
          itemsJson: itemsJson || null,
          createdById,
        },
      });
    });
  }
}

module.exports = new TransactionsService();
