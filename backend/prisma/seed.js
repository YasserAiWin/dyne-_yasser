const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting database...');
  // Delete in reverse order of relations to prevent foreign key violations
  await prisma.transaction.deleteMany();
  await prisma.shopWhatsappSetting.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.shop.deleteMany();

  console.log('Seeding Mauritanian data...');

  const passwordHash = bcrypt.hashSync('Shop123456', 10);
  const adminPasswordHash = bcrypt.hashSync('Admin123456', 10);

  const now = new Date();

  // Helper to add days
  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };

  // 1. Create Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      name: 'سيدي محمد ولد عبد الله',
      phone: '+22236124567',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  console.log(`Created Super Admin: ${superAdmin.phone}`);

  // Helper to create a shop, owner, and whatsapp settings in a transaction
  const createShopWithDetails = async ({ shopName, ownerName, phone, startDate, expiryDate, isSuspended }) => {
    return prisma.$transaction(async (tx) => {
      const shop = await tx.shop.create({
        data: {
          shopName,
          ownerName,
          phone,
          startDate,
          expiryDate,
          isSuspended,
        },
      });

      const user = await tx.user.create({
        data: {
          name: ownerName,
          phone,
          passwordHash,
          role: 'SHOP_OWNER',
          shopId: shop.id,
          isActive: true,
        },
      });

      const whatsapp = await tx.shopWhatsappSetting.create({
        data: {
          shopId: shop.id,
          provider: 'EVOLUTION',
          connectionStatus: 'DISCONNECTED',
        },
      });

      return { shop, user, whatsapp };
    });
  };

  // 2. Active Shop: بقالة الأمانة
  const { shop: shop1, user: owner1 } = await createShopWithDetails({
    shopName: 'بقالة الأمانة',
    ownerName: 'محمد ولد أحمد',
    phone: '+22222103344',
    startDate: now,
    expiryDate: addDays(now, 30),
    isSuspended: false,
  });
  console.log(`Created Active Shop: ${shop1.shopName} (Owner: ${owner1.phone})`);

  // Customers for بقالة الأمانة
  const customer1_1 = await prisma.customer.create({
    data: { shopId: shop1.id, name: 'الشيخ ولد محمد', phone: '+22241885566' },
  });
  const customer1_2 = await prisma.customer.create({
    data: { shopId: shop1.id, name: 'أم الخير بنت أحمد', phone: '+22233334444' },
  });
  const customer1_3 = await prisma.customer.create({
    data: { shopId: shop1.id, name: 'المختار ولد سيديا', phone: '+22244445555' },
  });
  const customer1_4 = await prisma.customer.create({
    data: { shopId: shop1.id, name: 'أحمدو ولد سالم', phone: '+22255556666' },
  });
  const customer1_5_deleted = await prisma.customer.create({
    data: { shopId: shop1.id, name: 'عميل محذوف', phone: '+22266667777', deletedAt: now },
  });

  // Transactions for الشيخ ولد محمد (Alice substitute): Debts: 100, 50. Payments: 30. Balance: 120.00
  await prisma.transaction.createMany({
    data: [
      { shopId: shop1.id, customerId: customer1_1.id, type: 'DEBT', amount: 100.00, note: 'مواد غذائية', createdById: owner1.id },
      { shopId: shop1.id, customerId: customer1_1.id, type: 'DEBT', amount: 50.00, note: 'شاي وسكر', createdById: owner1.id },
      { shopId: shop1.id, customerId: customer1_1.id, type: 'PAYMENT', amount: 30.00, note: 'دفعة جزئية', createdById: owner1.id },
    ],
  });

  // Transactions for أم الخير بنت أحمد (Bob substitute): Debts: 200. Payments: 50. Balance: 150.00
  await prisma.transaction.createMany({
    data: [
      { shopId: shop1.id, customerId: customer1_2.id, type: 'DEBT', amount: 200.00, note: 'لوازم منزلية', createdById: owner1.id },
      { shopId: shop1.id, customerId: customer1_2.id, type: 'PAYMENT', amount: 50.00, note: 'دفعة على الحساب', createdById: owner1.id },
    ],
  });

  // Transactions for المختار ولد سيديا (Charlie substitute): Debts: 80. Payments: 80. Balance: 0.00 (Settled)
  await prisma.transaction.createMany({
    data: [
      { shopId: shop1.id, customerId: customer1_3.id, type: 'DEBT', amount: 80.00, note: 'خضروات وفواكه', createdById: owner1.id },
      { shopId: shop1.id, customerId: customer1_3.id, type: 'PAYMENT', amount: 80.00, note: 'تسوية الحساب كاملا', createdById: owner1.id },
    ],
  });

  // Transactions for أحمدو ولد سالم (David substitute): Debts: 50. Payments: 120. Balance: -70.00 (Credit)
  await prisma.transaction.createMany({
    data: [
      { shopId: shop1.id, customerId: customer1_4.id, type: 'DEBT', amount: 50.00, note: 'أواني منزلية', createdById: owner1.id },
      { shopId: shop1.id, customerId: customer1_4.id, type: 'PAYMENT', amount: 120.00, note: 'رصيد زائد مدفوع مقدما', createdById: owner1.id },
    ],
  });


  // 3. Expiring Soon Shop: متجر النور
  const { shop: shop2, user: owner2 } = await createShopWithDetails({
    shopName: 'متجر النور',
    ownerName: 'أحمدو ولد سالم',
    phone: '+22245789012',
    startDate: now,
    expiryDate: addDays(now, 3), // 3 days remaining <= 5
    isSuspended: false,
  });
  console.log(`Created Expiring Soon Shop: ${shop2.shopName} (Owner: ${owner2.phone})`);

  const customer2_1 = await prisma.customer.create({
    data: { shopId: shop2.id, name: 'فاطمة بنت محمد', phone: '+22277778888' },
  });
  await prisma.transaction.create({
    data: { shopId: shop2.id, customerId: customer2_1.id, type: 'DEBT', amount: 40.00, note: 'طلبية خبز وحلويات', createdById: owner2.id },
  });


  // 4. Expired Shop: محل أهل المختار
  const { shop: shop3, user: owner3 } = await createShopWithDetails({
    shopName: 'محل أهل المختار',
    ownerName: 'فاطمة بنت محمد',
    phone: '+22240312211',
    startDate: addDays(now, -35),
    expiryDate: addDays(now, -5), // expired 5 days ago
    isSuspended: false,
  });
  console.log(`Created Expired Shop: ${shop3.shopName} (Owner: ${owner3.phone})`);

  const customer3_1 = await prisma.customer.create({
    data: { shopId: shop3.id, name: 'خديجة بنت المختار', phone: '+22288889999' },
  });
  await prisma.transaction.create({
    data: { shopId: shop3.id, customerId: customer3_1.id, type: 'DEBT', amount: 100.00, note: 'ملابس نسائية', createdById: owner3.id },
  });


  // 5. Suspended Shop: سوبر ماركت الساحل
  const { shop: shop4, user: owner4 } = await createShopWithDetails({
    shopName: 'سوبر ماركت الساحل',
    ownerName: 'خديجة بنت المختار',
    phone: '+22236601175',
    startDate: now,
    expiryDate: addDays(now, 30),
    isSuspended: true, // suspended
  });
  console.log(`Created Suspended Shop: ${shop4.shopName} (Owner: ${owner4.phone})`);

  const customer4_1 = await prisma.customer.create({
    data: { shopId: shop4.id, name: 'المختار ولد سيديا', phone: '+22299990000' },
  });
  await prisma.transaction.create({
    data: { shopId: shop4.id, customerId: customer4_1.id, type: 'DEBT', amount: 250.00, note: 'سلع غذائية مستوردة', createdById: owner4.id },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
