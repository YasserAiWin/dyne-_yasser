# نظام إدارة ديون المتاجر — الواجهة الأمامية (Frontend)

Shop Debt Management System — production-ready React frontend.

A clean, professional Arabic (RTL) SaaS dashboard for managing shops, subscriptions, customers, and debts. Built mobile-first with mock data, fully wired to switch to a real backend.

---

## التقنيات / Tech Stack

- **React 18** + **Vite**
- **Tailwind CSS** (custom emerald theme)
- **React Router v6**
- **Axios** (with auth interceptors + mock fallback)
- **Arabic RTL** layout, mobile-first responsive design
- Google Fonts: Cairo / Tajawal

---

## التشغيل / Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

Other commands:

```bash
npm run build     # production build → dist/
npm run preview   # preview the production build
```

### Demo login

Mock mode accepts any Mauritanian phone number and password.
Example: `+222 36 12 45 67` / any password

Pick a role on the login screen:

- **صاحب المتجر** (Shop Owner) → shop dashboard
- **المدير العام** (Super Admin) → admin dashboard

---

## إعدادات البيئة / Environment

Configured in `.env`:

```
VITE_API_URL=http://localhost:5000/api
VITE_USE_MOCK=true
```

- `VITE_API_URL` — base URL for the backend API.
- `VITE_USE_MOCK` — `true` uses local mock data; set to `false` to call the real backend.

---

## هيكل المشروع / Project Structure

```
src/
├── main.jsx                     # App entry
├── App.jsx                      # Router root
├── routes/
│   ├── AppRoutes.jsx            # Route definitions
│   └── ProtectedRoute.jsx       # Auth + role guard
├── layouts/
│   ├── AdminLayout.jsx          # Admin shell (sidebar + header)
│   └── ShopLayout.jsx           # Shop owner shell
├── pages/
│   ├── auth/Login.jsx
│   ├── admin/AdminDashboard.jsx
│   ├── admin/ShopsList.jsx
│   ├── admin/CreateShop.jsx
│   ├── admin/SubscriptionManagement.jsx
│   ├── shop/ShopDashboard.jsx
│   ├── shop/CustomersList.jsx
│   └── shop/CustomerProfile.jsx
├── components/                  # Reusable UI
│   ├── Sidebar.jsx  Header.jsx  StatCard.jsx  StatusBadge.jsx
│   ├── DataTable.jsx  Button.jsx  Input.jsx  Card.jsx  icons.jsx
├── services/                    # Axios + API services
│   ├── api.js  authService.js  shopsService.js
│   ├── customersService.js  transactionsService.js
├── data/mockData.js             # Mock dataset
├── utils/format.js              # Currency / date / date-math helpers
└── styles/index.css             # Tailwind + base styles
```

---

## الصفحات المنفذة / Pages

1. **تسجيل الدخول** — Login (role tabs: owner / admin)
2. **لوحة المدير العام** — Super Admin Dashboard
3. **قائمة المتاجر** — Shops List (search + filters)
4. **إضافة متجر** — Create Shop (with subscription summary)
5. **إدارة الاشتراكات** — Subscription Management (extension panel)
6. **لوحة صاحب المتجر** — Shop Owner Dashboard
7. **قائمة العملاء** — Customers List (search, filters, add modal)
8. **ملف العميل** — Customer Profile (add debt / payment, running balance, history)

---

## المسارات / Routes

| Route                     | Page                    |
| ------------------------- | ----------------------- |
| `/login`                  | Login                   |
| `/admin/dashboard`        | Admin Dashboard         |
| `/admin/shops`            | Shops List              |
| `/admin/shops/create`     | Create Shop             |
| `/admin/subscriptions`    | Subscription Management |
| `/shop/dashboard`         | Shop Dashboard          |
| `/shop/customers`         | Customers List          |
| `/shop/customers/:id`     | Customer Profile        |

---

## التكامل مع الـ Backend / Backend Integration

The services layer is ready. To switch from mock data to the real API:

1. Set `VITE_USE_MOCK=false` in `.env`.
2. Ensure the backend matches the endpoints used in `src/services/*` (base URL `http://localhost:5000/api`):
   - Auth: `POST /auth/login`, `GET /auth/me`
   - Admin: `GET /admin/dashboard`, `GET /admin/shops`, `POST /admin/shops`, `GET /admin/shops/:id`, `PUT /admin/shops/:id`, `POST /admin/shops/:id/extend-subscription`, `GET /admin/shops-expiring`, `GET /admin/shops-expired`
   - Shop: `GET /shop/dashboard`, `GET /shop/customers`, `POST /shop/customers`, `GET /shop/customers/:id`, `PUT /shop/customers/:id`, `DELETE /shop/customers/:id`, `GET /shop/customers/:customerId/transactions`, `POST /shop/customers/:customerId/debts`, `POST /shop/customers/:customerId/payments`
   - WhatsApp: `GET /shop/whatsapp/settings`, `PUT /shop/whatsapp/settings`

The Axios instance (`src/services/api.js`) automatically attaches the bearer token and redirects to `/login` on `401`.

---

## القيود المعروفة / Known Limitations

- Uses mock data by default; no real persistence until the backend is connected.
- Auth is mocked — any phone number/password succeeds in demo mode.
- Stats and charts are simple (progress bars / summaries), not a charting library.
- No form-level validation library; uses native HTML validation.
- Edit-shop action is a placeholder button (no edit form yet).
