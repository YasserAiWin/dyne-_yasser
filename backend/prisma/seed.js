const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting database...');
  await prisma.transaction.deleteMany();
  await prisma.shopWhatsappSetting.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.shop.deleteMany();

  console.log('Seeding data...');

  // Shop owners use numeric PIN (4-8 digits)
  const ownerPinHash = bcrypt.hashSync('12345678', 10);
  // Super admin uses email + strong password
  const adminPasswordHash = bcrypt.hashSync('Admin@2026!', 10);

  const now = new Date();
  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };

  // 1. Super Admin (logs in with email + password)
  const superAdmin = await prisma.user.create({
    data: {
      name: 'المدير العام',
      phone: '+22236000000',
      email: 'admin@abidb.mr',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  console.log(`Created Super Admin: email=${superAdmin.email}`);

  // Helper to create a shop + owner + whatsapp settings
  const createShopWithDetails = async ({ shopName, ownerName, phone, startDate, expiryDate, isSuspended }) => {
    return prisma.$transaction(async (tx) => {
      const shop = await tx.shop.create({
        data: { shopName, ownerName, phone, startDate, expiryDate, isSuspended },
      });

      const user = await tx.user.create({
        data: {
          name: ownerName,
          phone,
          passwordHash: ownerPinHash,
          role: 'SHOP_OWNER',
          shopId: shop.id,
          isActive: true,
        },
      });

      await tx.shopWhatsappSetting.create({
        data: { shopId: shop.id, provider: 'EVOLUTION', connectionStatus: 'DISCONNECTED' },
      });

      return { shop, user };
    });
  };

  // 2. Active shop
  const { shop: shop1, user: owner1 } = await createShopWithDetails({
    shopName: 'بقالة الأمانة',
    ownerName: 'محمد ولد أحمد',
    phone: '+22222103344',
    startDate: now,
    expiryDate: addDays(now, 30),
    isSuspended: false,
  });
  console.log(`Created Active Shop: ${shop1.shopName} — phone: ${owner1.phone} — PIN: 12345678`);

  const c1 = await prisma.customer.create({ data: { shopId: shop1.id, name: 'الشيخ ولد محمد', phone: '+22241885566' } });
  const c2 = await prisma.customer.create({ data: { shopId: shop1.id, name: 'أم الخير بنت أحمد', phone: '+22233334444' } });
  const c3 = await prisma.customer.create({ data: { shopId: shop1.id, name: 'المختار ولد سيديا', phone: '+22244445555' } });
  const c4 = await prisma.customer.create({ data: { shopId: shop1.id, name: 'أحمدو ولد سالم', phone: '+22255556666' } });

  await prisma.transaction.createMany({
    data: [
      { shopId: shop1.id, customerId: c1.id, type: 'DEBT', amount: 100.00, note: 'مواد غذائية', createdById: owner1.id },
      { shopId: shop1.id, customerId: c1.id, type: 'DEBT', amount: 50.00, note: 'شاي وسكر', createdById: owner1.id },
      { shopId: shop1.id, customerId: c1.id, type: 'PAYMENT', amount: 30.00, note: 'دفعة جزئية', createdById: owner1.id },
      { shopId: shop1.id, customerId: c2.id, type: 'DEBT', amount: 200.00, note: 'لوازم منزلية', createdById: owner1.id },
      { shopId: shop1.id, customerId: c2.id, type: 'PAYMENT', amount: 50.00, note: 'دفعة على الحساب', createdById: owner1.id },
      { shopId: shop1.id, customerId: c3.id, type: 'DEBT', amount: 80.00, note: 'خضروات وفواكه', createdById: owner1.id },
      { shopId: shop1.id, customerId: c3.id, type: 'PAYMENT', amount: 80.00, note: 'تسوية الحساب', createdById: owner1.id },
      { shopId: shop1.id, customerId: c4.id, type: 'DEBT', amount: 50.00, note: 'أواني منزلية', createdById: owner1.id },
      { shopId: shop1.id, customerId: c4.id, type: 'PAYMENT', amount: 120.00, note: 'رصيد زائد', createdById: owner1.id },
    ],
  });

  // 3. Expiring soon (3 days left)
  const { shop: shop2, user: owner2 } = await createShopWithDetails({
    shopName: 'متجر النور',
    ownerName: 'أحمدو ولد سالم',
    phone: '+22245789012',
    startDate: now,
    expiryDate: addDays(now, 3),
    isSuspended: false,
  });
  console.log(`Created Expiring Soon Shop: ${shop2.shopName} — phone: ${owner2.phone} — PIN: 12345678`);

  const c5 = await prisma.customer.create({ data: { shopId: shop2.id, name: 'فاطمة بنت محمد', phone: '+22277778888' } });
  await prisma.transaction.create({
    data: { shopId: shop2.id, customerId: c5.id, type: 'DEBT', amount: 40.00, note: 'طلبية خبز', createdById: owner2.id },
  });

  // 4. Expired (5 days ago)
  const { shop: shop3, user: owner3 } = await createShopWithDetails({
    shopName: 'محل أهل المختار',
    ownerName: 'فاطمة بنت محمد',
    phone: '+22240312211',
    startDate: addDays(now, -35),
    expiryDate: addDays(now, -5),
    isSuspended: false,
  });
  console.log(`Created Expired Shop: ${shop3.shopName} — phone: ${owner3.phone} — PIN: 12345678`);

  const c6 = await prisma.customer.create({ data: { shopId: shop3.id, name: 'خديجة بنت المختار', phone: '+22288889999' } });
  await prisma.transaction.create({
    data: { shopId: shop3.id, customerId: c6.id, type: 'DEBT', amount: 100.00, note: 'ملابس', createdById: owner3.id },
  });

  // 5. Suspended
  const { shop: shop4, user: owner4 } = await createShopWithDetails({
    shopName: 'سوبر ماركت الساحل',
    ownerName: 'خديجة بنت المختار',
    phone: '+22236601175',
    startDate: now,
    expiryDate: addDays(now, 30),
    isSuspended: true,
  });
  console.log(`Created Suspended Shop: ${shop4.shopName} — phone: ${owner4.phone} — PIN: 12345678`);

  const c7 = await prisma.customer.create({ data: { shopId: shop4.id, name: 'المختار ولد سيديا', phone: '+22299990000' } });
  await prisma.transaction.create({
    data: { shopId: shop4.id, customerId: c7.id, type: 'DEBT', amount: 250.00, note: 'سلع غذائية', createdById: owner4.id },
  });

  console.log('\n✅ Seeding completed!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 Super Admin  →  admin@abidb.mr  /  Admin@2026!');
  console.log('🏪 Shop Owners  →  phone number  /  PIN: 12345678');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
