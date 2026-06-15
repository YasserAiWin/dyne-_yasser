// ---------------------------------------------------------------------------
// Mock data used while the backend is not yet wired up.
// Shape mirrors the expected API responses so swapping to real data is trivial.
// ---------------------------------------------------------------------------

// ---- Admin: shops --------------------------------------------------------
export const shops = [
  {
    id: 1,
    name: 'بقالة الأمانة',
    ownerName: 'محمد ولد أحمد',
    phone: '+222 36 12 45 67',
    startDate: '2025-08-01',
    endDate: '2026-08-01',
    plan: 'سنوي',
    status: 'active',
  },
  {
    id: 2,
    name: 'متجر النور',
    ownerName: 'أحمدو ولد سالم',
    phone: '+222 22 10 33 44',
    startDate: '2025-06-20',
    endDate: '2026-06-25',
    plan: 'سنوي',
    status: 'expiring',
  },
  {
    id: 3,
    name: 'محل أهل المختار',
    ownerName: 'سيدي محمد ولد عبد الله',
    phone: '+222 45 78 90 12',
    startDate: '2025-01-10',
    endDate: '2026-01-10',
    plan: 'سنوي',
    status: 'expired',
  },
  {
    id: 4,
    name: 'سوبر ماركت الساحل',
    ownerName: 'الشيخ ولد محمد',
    phone: '+222 40 31 22 11',
    startDate: '2026-03-01',
    endDate: '2026-09-01',
    plan: 'نصف سنوي',
    status: 'active',
  },
  {
    id: 5,
    name: 'بقالة المدينة',
    ownerName: 'محمد ولد أحمد',
    phone: '+222 36 55 21 09',
    startDate: '2025-12-01',
    endDate: '2026-06-20',
    plan: 'نصف سنوي',
    status: 'expiring',
  },
  {
    id: 6,
    name: 'متجر شنقيط',
    ownerName: 'سيدي محمد ولد عبد الله',
    phone: '+222 22 44 66 88',
    startDate: '2026-02-15',
    endDate: '2027-02-15',
    plan: 'سنوي',
    status: 'active',
  },
  {
    id: 7,
    name: 'سوق الجملة',
    ownerName: 'أحمدو ولد سالم',
    phone: '+222 45 11 33 55',
    startDate: '2025-05-05',
    endDate: '2026-05-05',
    plan: 'سنوي',
    status: 'expired',
  },
]

// ---- Shop owner: customers ----------------------------------------------
export const customers = [
  {
    id: 1,
    name: 'محمد ولد أحمد',
    phone: '+222 36 12 45 67',
    balance: 450, // positive = customer owes the shop (debt)
    status: 'debtor',
  },
  {
    id: 2,
    name: 'أحمدو ولد سالم',
    phone: '+222 22 10 33 44',
    balance: 0,
    status: 'settled',
  },
  {
    id: 3,
    name: 'فاطمة بنت محمد',
    phone: '+222 45 78 90 12',
    balance: -120, // negative = shop owes the customer (credit)
    status: 'credit',
  },
  {
    id: 4,
    name: 'سيدي محمد ولد عبد الله',
    phone: '+222 40 31 22 11',
    balance: 980,
    status: 'debtor',
  },
  {
    id: 5,
    name: 'خديجة بنت المختار',
    phone: '+222 36 55 21 09',
    balance: 0,
    status: 'settled',
  },
  {
    id: 6,
    name: 'الشيخ ولد محمد',
    phone: '+222 22 44 66 88',
    balance: 250,
    status: 'debtor',
  },
  {
    id: 7,
    name: 'أم الخير بنت أحمد',
    phone: '+222 45 11 33 55',
    balance: -60,
    status: 'credit',
  },
  {
    id: 8,
    name: 'خديجة بنت المختار',
    phone: '+222 40 99 88 77',
    balance: 1500,
    status: 'debtor',
  },
]

// ---- Customer transactions (keyed by customer id) ------------------------
export const transactions = {
  1: [
    { id: 101, type: 'debt', amount: 300, note: 'مواد غذائية', date: '2026-05-02', balanceAfter: 300 },
    { id: 102, type: 'payment', amount: 150, note: 'دفعة نقدية', date: '2026-05-20', balanceAfter: 150 },
    { id: 103, type: 'debt', amount: 300, note: 'بضاعة متنوعة', date: '2026-06-01', balanceAfter: 450 },
  ],
  3: [
    { id: 301, type: 'debt', amount: 80, note: 'حليب وخبز', date: '2026-05-10', balanceAfter: 80 },
    { id: 302, type: 'payment', amount: 200, note: 'دفعة مقدمة', date: '2026-05-25', balanceAfter: -120 },
  ],
  4: [
    { id: 401, type: 'debt', amount: 500, note: 'طلبية شهرية', date: '2026-04-15', balanceAfter: 500 },
    { id: 402, type: 'debt', amount: 480, note: 'مواد تنظيف', date: '2026-05-30', balanceAfter: 980 },
  ],
  8: [
    { id: 801, type: 'debt', amount: 1000, note: 'بضاعة بالجملة', date: '2026-03-12', balanceAfter: 1000 },
    { id: 802, type: 'debt', amount: 700, note: 'طلبية إضافية', date: '2026-04-20', balanceAfter: 1700 },
    { id: 803, type: 'payment', amount: 200, note: 'دفعة جزئية', date: '2026-05-18', balanceAfter: 1500 },
  ],
}

// ---- Recent transactions feed for the shop dashboard ---------------------
export const recentTransactions = [
  { id: 1, customer: 'محمد ولد أحمد', type: 'debt', amount: 300, date: '2026-06-15' },
  { id: 2, customer: 'خديجة بنت المختار', type: 'payment', amount: 200, date: '2026-06-15' },
  { id: 3, customer: 'سيدي محمد ولد عبد الله', type: 'debt', amount: 480, date: '2026-06-14' },
  { id: 4, customer: 'فاطمة بنت محمد', type: 'payment', amount: 200, date: '2026-06-14' },
  { id: 5, customer: 'الشيخ ولد محمد', type: 'debt', amount: 250, date: '2026-06-13' },
]

// ---- Dashboard stats -----------------------------------------------------
export const adminStats = {
  totalShops: 7,
  activeShops: 3,
  expiringShops: 2,
  expiredShops: 2,
  renewalsThisMonth: 4,
}

export const shopStats = {
  totalCustomers: 8,
  totalDebt: 3180,
  debtorsCount: 4,
  creditorsCount: 2,
  todayPayments: 200,
}

// ---- Subscription plans --------------------------------------------------
export const subscriptionPlans = [
  { id: 'monthly', label: 'شهري', months: 1 },
  { id: 'quarterly', label: 'ربع سنوي', months: 3 },
  { id: 'halfyear', label: 'نصف سنوي', months: 6 },
  { id: 'yearly', label: 'سنوي', months: 12 },
]
