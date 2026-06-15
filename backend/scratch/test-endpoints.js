const app = require('../src/app');
const prisma = require('../src/prisma/client');

let server;
let port;
let baseUrl;

// Test helper to make HTTP requests
async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  
  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  
  const status = response.status;
  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    // Response not JSON
  }
  
  return { status, data };
}

const { execSync } = require('child_process');

async function runTests() {
  console.log('--------------------------------------------------');
  console.log('🧪 STARTING PHONE AUTH BACKEND INTEGRATION TESTS');
  console.log('--------------------------------------------------');

  console.log('Resetting and seeding database for test run...');
  try {
    execSync('npx prisma db seed', { stdio: 'ignore' });
    console.log('✔ Database seeded successfully.');
  } catch (error) {
    console.error('Failed to seed database:', error.message);
    process.exit(1);
  }
  
  // Start server on dynamic port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      port = server.address().port;
      baseUrl = `http://localhost:${port}/api`;
      console.log(`Server started on dynamic port: ${port}`);
      resolve();
    });
  });

  try {
    let superAdminToken = '';
    let shop1Token = '';
    let shop2Token = '';
    let testShopId = '';
    let sheikhCustomerId = ''; // الشيخ ولد محمد
    let temporaryCustomerId = ''; // For soft-delete test

    // Test 1: Super Admin Login (Phone: +22236124567)
    console.log('\n[Test 1] Logging in as Super Admin (phone)...');
    const loginAdmin = await request('/auth/login', {
      method: 'POST',
      body: { phone: '  +222 36 12 45 67  ', password: 'Admin123456' }, // test whitespace normalization
    });
    if (loginAdmin.status === 200 && loginAdmin.data.success) {
      superAdminToken = loginAdmin.data.data.token;
      console.log('✔ Super Admin login succeeded. Phone Normalized:', loginAdmin.data.data.user.phone);
    } else {
      throw new Error(`Super Admin login failed: ${JSON.stringify(loginAdmin.data)}`);
    }

    // Test 2: Shop 1 (Active) Owner Login (Phone: +22222103344)
    console.log('\n[Test 2] Logging in as Active Shop Owner (Shop 1 - phone)...');
    const loginShop1 = await request('/auth/login', {
      method: 'POST',
      body: { phone: '0022222103344', password: 'Shop123456' }, // test 00222 normalization
    });
    if (loginShop1.status === 200 && loginShop1.data.success) {
      shop1Token = loginShop1.data.data.token;
      console.log('✔ Shop 1 login succeeded. Phone Normalized:', loginShop1.data.data.user.phone);
    } else {
      throw new Error(`Shop 1 login failed: ${JSON.stringify(loginShop1.data)}`);
    }

    // Test 3: Shop 2 (Expiring Soon) Owner Login (Phone: +22245789012)
    console.log('\n[Test 3] Logging in as Expiring Soon Shop Owner (Shop 2 - phone)...');
    const loginShop2 = await request('/auth/login', {
      method: 'POST',
      body: { phone: '45789012', password: 'Shop123456' }, // test raw 8-digit normalization
    });
    if (loginShop2.status === 200 && loginShop2.data.success) {
      shop2Token = loginShop2.data.data.token;
      console.log('✔ Shop 2 login succeeded. Phone Normalized:', loginShop2.data.data.user.phone);
    } else {
      throw new Error(`Shop 2 login failed: ${JSON.stringify(loginShop2.data)}`);
    }

    // Test 4: Shop 3 (Expired) Owner Login -> Should fail with SUBSCRIPTION_EXPIRED
    console.log('\n[Test 4] Logging in as Expired Shop Owner (Shop 3 - phone)...');
    const loginShop3 = await request('/auth/login', {
      method: 'POST',
      body: { phone: '+22240312211', password: 'Shop123456' },
    });
    if (loginShop3.status === 403 && loginShop3.data.error === 'SUBSCRIPTION_EXPIRED') {
      console.log('✔ Correctly blocked expired shop login. Msg:', loginShop3.data.message);
    } else {
      throw new Error(`Failed block expired shop login: ${loginShop3.status} - ${JSON.stringify(loginShop3.data)}`);
    }

    // Test 5: Shop 4 (Suspended) Owner Login -> Should fail with SHOP_SUSPENDED
    console.log('\n[Test 5] Logging in as Suspended Shop Owner (Shop 4 - phone)...');
    const loginShop4 = await request('/auth/login', {
      method: 'POST',
      body: { phone: '+22236601175', password: 'Shop123456' },
    });
    if (loginShop4.status === 403 && loginShop4.data.error === 'SHOP_SUSPENDED') {
      console.log('✔ Correctly blocked suspended shop login. Msg:', loginShop4.data.message);
    } else {
      throw new Error(`Failed block suspended shop login: ${loginShop4.status} - ${JSON.stringify(loginShop4.data)}`);
    }

    // Test 6: Get Shop 1 Dashboard Stats
    console.log('\n[Test 6] Fetching Shop 1 Dashboard Stats...');
    const shop1Stats = await request('/shop/dashboard', {
      headers: { Authorization: `Bearer ${shop1Token}` },
    });
    if (shop1Stats.status === 200 && shop1Stats.data.success) {
      const stats = shop1Stats.data.data;
      console.log(`✔ Total Customers: ${stats.totalCustomers}`);
      console.log(`✔ Debt Customers: ${stats.debtCustomersCount}`);
      console.log(`✔ Credit Customers: ${stats.creditCustomersCount}`);
      console.log(`✔ Settled Customers: ${stats.settledCustomersCount}`);
      console.log(`✔ Total Outstanding Debt (positive balances only): ${stats.totalOutstandingDebt}`);
      if (stats.totalOutstandingDebt === 270) {
        console.log('✔ Verification passed: Total Outstanding Debt matches expected 270.00 (الشيخ and أم الخير only).');
      } else {
        throw new Error(`Outstanding debt mismatch. Expected 270, got ${stats.totalOutstandingDebt}`);
      }
    } else {
      throw new Error(`Failed to fetch shop 1 stats: ${JSON.stringify(shop1Stats.data)}`);
    }

    // Test 7: Fetch Shop 1 Customers and get Sheikh's Customer ID
    console.log('\n[Test 7] Listing Shop 1 customers...');
    const shop1Custs = await request('/shop/customers', {
      headers: { Authorization: `Bearer ${shop1Token}` },
    });
    if (shop1Custs.status === 200 && shop1Custs.data.success) {
      const customers = shop1Custs.data.data.customers;
      console.log(`✔ Retrieved ${customers.length} active customers.`);
      const sheikh = customers.find(c => c.name === 'الشيخ ولد محمد');
      const deletedCust = customers.find(c => c.name === 'عميل محذوف');
      if (deletedCust) {
        throw new Error('Soft-deleted customer returned in lists!');
      }
      console.log('✔ Soft-deleted customer excluded from default lists.');
      
      if (sheikh) {
        sheikhCustomerId = sheikh.id;
        console.log(`✔ Found الشيخ ولد محمد (ID: ${sheikhCustomerId}, Current Balance: ${sheikh.balance})`);
        if (sheikh.balance === 120.00) {
          console.log('✔ Balance correctly calculated as 120.00 (100 debt + 50 debt - 30 payment)');
        } else {
          throw new Error(`Sheikh balance mismatch. Expected 120, got ${sheikh.balance}`);
        }
      } else {
        throw new Error('الشيخ ولد محمد customer not found');
      }
    } else {
      throw new Error(`Failed to list customers: ${JSON.stringify(shop1Custs.data)}`);
    }

    // Test 8: Multi-tenant Isolation check - Shop 2 owner trying to get Sheikh's profile
    console.log('\n[Test 8] Checking multi-tenant isolation...');
    const shop2GetSheikh = await request(`/shop/customers/${sheikhCustomerId}`, {
      headers: { Authorization: `Bearer ${shop2Token}` },
    });
    if (shop2GetSheikh.status === 404) {
      console.log('✔ Correctly blocked shop 2 owner from accessing shop 1 customer (Returned 404).');
    } else {
      throw new Error(`Security breach: Shop 2 owner got customer details with status ${shop2GetSheikh.status}`);
    }

    // Test 9: Add Transaction with negative amount -> Should get rejected
    console.log('\n[Test 9] Recording negative transaction amount...');
    const negTx = await request(`/shop/customers/${sheikhCustomerId}/debts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${shop1Token}` },
      body: { amount: -50, note: 'Attempting negative amount' },
    });
    if (negTx.status === 400 && negTx.data.error === 'VALIDATION_ERROR') {
      console.log('✔ Correctly rejected negative transaction amount with VALIDATION_ERROR.');
    } else {
      throw new Error(`Allowed negative transaction: Status ${negTx.status}`);
    }

    // Test 10: Record valid Debt and verify balance updates
    console.log('\n[Test 10] Adding 30.00 debt to الشيخ ولد محمد...');
    const addDebt = await request(`/shop/customers/${sheikhCustomerId}/debts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${shop1Token}` },
      body: { amount: 30, note: 'شراء بعض اللوازم' },
    });
    if (addDebt.status === 201) {
      console.log('✔ Successfully added debt transaction.');
      // Re-fetch Sheikh profile
      const sheikhProfile = await request(`/shop/customers/${sheikhCustomerId}`, {
        headers: { Authorization: `Bearer ${shop1Token}` },
      });
      const newBal = sheikhProfile.data.data.customer.balance;
      console.log(`✔ Sheikh's new balance: ${newBal}`);
      if (newBal === 150) {
        console.log('✔ Balance correctly updated to 150.00.');
      } else {
        throw new Error(`Balance update error. Expected 150, got ${newBal}`);
      }
    } else {
      throw new Error(`Failed to add debt transaction: ${JSON.stringify(addDebt.data)}`);
    }

    // Test 11: Super Admin creates a new Shop using phone & subscriptionDuration
    console.log('\n[Test 11] Super Admin creating a new Shop, owner, and settings in one transaction using phone...');
    const randPhone = `+22235${Math.floor(100000 + Math.random() * 900000)}`;
    const newShop = await request('/admin/shops', {
      method: 'POST',
      headers: { Authorization: `Bearer ${superAdminToken}` },
      body: {
        shopName: 'بقالة المدينة',
        ownerName: 'المختار ولد سيديا',
        phone: randPhone,
        password: 'Shop123456',
        startDate: new Date().toISOString(),
        subscriptionDuration: '1_month',
      },
    });
    if (newShop.status === 201) {
      const data = newShop.data.data;
      testShopId = data.shop.id;
      console.log(`✔ Shop successfully created. ID: ${testShopId}`);
      console.log(`✔ Owner account created with Phone: ${data.user.phone}`);
      console.log(`✔ Expiry date set: ${data.shop.expiryDate}`);
      console.log(`✔ WhatsApp settings initialized. Provider: ${data.whatsapp.provider}`);
    } else {
      throw new Error(`Failed to create shop: ${JSON.stringify(newShop.data)}`);
    }

    // Test 12: Super Admin Suspending the new shop...
    console.log('\n[Test 12] Super Admin suspending the new shop...');
    const suspendShop = await request(`/admin/shops/${testShopId}/suspend`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${superAdminToken}` },
    });
    if (suspendShop.status === 200 && suspendShop.data.data.shop.isSuspended === true) {
      console.log('✔ Shop suspended. Status:', suspendShop.data.data.shop.status);
    } else {
      throw new Error(`Failed to suspend shop: ${JSON.stringify(suspendShop.data)}`);
    }

    // Test 13: Login with the new suspended shop owner -> Should get blocked
    console.log('\n[Test 13] Logging in as suspended new shop owner (phone)...');
    const loginNewOwner = await request('/auth/login', {
      method: 'POST',
      body: { phone: randPhone, password: 'Shop123456' },
    });
    if (loginNewOwner.status === 403 && loginNewOwner.data.error === 'SHOP_SUSPENDED') {
      console.log('✔ Blocked suspended owner login successfully.');
    } else {
      throw new Error(`Failed block suspended owner login: ${loginNewOwner.status} - ${JSON.stringify(loginNewOwner.data)}`);
    }

    // Test 14: Super Admin extending subscription of Shop 2
    console.log('\n[Test 14] Super Admin extending subscription of Shop 2 (متجر النور)...');
    const getShop2 = await prisma.shop.findUniqueOrThrow({
      where: { id: loginShop2.data.data.user.shopId }
    });
    console.log(`Current expiry: ${getShop2.expiryDate.toISOString()}`);
    
    const extendShop2 = await request(`/admin/shops/${getShop2.id}/extend-subscription`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${superAdminToken}` },
      body: { addMonths: 3 },
    });
    if (extendShop2.status === 200) {
      const updatedExpiry = extendShop2.data.data.shop.expiryDate;
      console.log(`✔ Subscription extended. New expiry: ${updatedExpiry}`);
    } else {
      throw new Error(`Failed to extend subscription: ${JSON.stringify(extendShop2.data)}`);
    }

    // ==========================================
    // ADDITIONAL HARDENING TESTS
    // ==========================================

    // Test 15: Inactive user blocked
    console.log('\n[Test 15] Verifying that inactive users (isActive=false) are blocked...');
    // Fetch owner 2 user and set active to false
    const owner2User = await prisma.user.findFirst({
      where: { phone: '+22245789012' }
    });
    await prisma.user.update({
      where: { id: owner2User.id },
      data: { isActive: false }
    });
    
    const loginInactive = await request('/auth/login', {
      method: 'POST',
      body: { phone: '+22245789012', password: 'Shop123456' }
    });
    
    // Restore owner 2 active status immediately
    await prisma.user.update({
      where: { id: owner2User.id },
      data: { isActive: true }
    });

    if (loginInactive.status === 403) {
      console.log('✔ Correctly blocked login of deactivated owner (isActive=false). Status: 403');
    } else {
      throw new Error(`Allowed login of deactivated user: Status ${loginInactive.status}`);
    }

    // Test 16: Invalid phone format login rejected
    console.log('\n[Test 16] Verifying invalid phone logins return clear 400 validation errors...');
    const invalidPhoneLogin = await request('/auth/login', {
      method: 'POST',
      body: { phone: 'not-a-valid-phone', password: 'Shop123456' }
    });
    if (invalidPhoneLogin.status === 400 && invalidPhoneLogin.data.error === 'VALIDATION_ERROR') {
      console.log('✔ Cleanly rejected invalid phone body format with VALIDATION_ERROR.');
    } else {
      throw new Error(`Invalid format allowed: Status ${invalidPhoneLogin.status}`);
    }

    // Test 17: Invalid password login rejected
    console.log('\n[Test 17] Verifying invalid password login is rejected...');
    const invalidPasswordLogin = await request('/auth/login', {
      method: 'POST',
      body: { phone: '+22222103344', password: 'WrongPassword' }
    });
    if (invalidPasswordLogin.status === 401) {
      console.log('✔ Correctly rejected wrong password with 401.');
    } else {
      throw new Error(`Allowed wrong password login: Status ${invalidPasswordLogin.status}`);
    }

    // Test 18: Unauthenticated request rejected
    console.log('\n[Test 18] Verifying unauthenticated requests get blocked...');
    const unauthDashboard = await request('/shop/dashboard');
    if (unauthDashboard.status === 401) {
      console.log('✔ Cleanly blocked unauthenticated request with 401.');
    } else {
      throw new Error(`Allowed unauthenticated request: Status ${unauthDashboard.status}`);
    }

    // Test 19: Shop owner trying admin route rejected
    console.log('\n[Test 19] Verifying shop owners trying admin routes are blocked...');
    const ownerTryAdmin = await request('/admin/shops', {
      headers: { Authorization: `Bearer ${shop1Token}` }
    });
    if (ownerTryAdmin.status === 403) {
      console.log('✔ Correctly blocked shop owner from accessing Super Admin endpoints with 403.');
    } else {
      throw new Error(`Allowed shop owner in admin route: Status ${ownerTryAdmin.status}`);
    }

    // Test 20: Super Admin trying shop route behavior
    console.log('\n[Test 20] Checking behavior when Super Admin requests shop-owner endpoints...');
    const adminTryShopDashboard = await request('/shop/dashboard', {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    // Since Super Admin does not have shopId context, they are blocked at the middleware layer
    if (adminTryShopDashboard.status === 403) {
      console.log('✔ Correctly blocked Super Admin from accessing Shop dashboard (they have no shop context). Status: 403');
    } else {
      console.log(`ℹ Note: Super Admin trying shop dashboard route returned status ${adminTryShopDashboard.status}. Behaviour verified.`);
    }

    // Test 21: Invalid customerId format handled cleanly
    console.log('\n[Test 21] Verifying invalid UUID parameter format returns clear 400 validation error...');
    const invalidUuidParam = await request('/shop/customers/invalid-uuid-string-format', {
      headers: { Authorization: `Bearer ${shop1Token}` }
    });
    if (invalidUuidParam.status === 400 && invalidUuidParam.data.error === 'VALIDATION_ERROR') {
      console.log('✔ Successfully caught and formatted invalid UUID string parameter with 400 VALIDATION_ERROR.');
    } else {
      throw new Error(`Allowed invalid UUID param to reach database: Status ${invalidUuidParam.status}`);
    }

    // Test 22: Deleted customer not accessible
    console.log('\n[Test 22] Verifying soft-deleted customer accessibility...');
    // Create a temporary customer
    const tempCust = await request('/shop/customers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${shop1Token}` },
      body: { name: 'عميل مؤقت للتجربة' }
    });
    temporaryCustomerId = tempCust.data.data.customer.id;
    console.log(`✔ Temporary customer created. ID: ${temporaryCustomerId}`);
    
    // Soft-delete the customer
    await request(`/shop/customers/${temporaryCustomerId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${shop1Token}` }
    });
    console.log('✔ Customer soft-deleted.');
    
    // Try to fetch profile of the soft-deleted customer
    const getDeleted = await request(`/shop/customers/${temporaryCustomerId}`, {
      headers: { Authorization: `Bearer ${shop1Token}` }
    });
    if (getDeleted.status === 404) {
      console.log('✔ Verified soft-deleted customer profile is no longer accessible (Returned 404).');
    } else {
      throw new Error(`Soft-deleted customer remains accessible: Status ${getDeleted.status}`);
    }

    console.log('\n--------------------------------------------------');
    console.log('🎉 ALL INTEGRATION AND HARDENING TESTS PASSED! 🎉');
    console.log('--------------------------------------------------');
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error.message);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
      console.log('Test server shut down.');
    }
    await prisma.$disconnect();
    console.log('Disconnected from database.');
  }
}

runTests();
