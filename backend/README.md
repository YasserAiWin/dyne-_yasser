# Shop Debt Management System Backend (API)

A production-ready multi-tenant shop debt management backend built using Node.js, Express, and PostgreSQL with Prisma ORM.

---

## 🚀 Key Features

1. **Multi-Tenant Shop Isolation**: Tenant safety is verified at the database query level using scoped queries. The request payload `shopId` parameter is never trusted.
2. **Dynamic Subscription Enforcement**: Checks shop status (Active, Expiring Soon, Expired, Suspended) on every request using `expiryDate` and `isSuspended` fields without storing stale state. Expired/suspended shops are locked out with explicit `403` status errors.
3. **Advanced Customer Balance Math**: Calculates customer running balances dynamically. Shop outstanding debt sums positive balances only—credits (negative balances) are ignored and do not reduce outstanding totals.
4. **Customer Soft Deletes**: Deleting a customer marks `deletedAt = now` to maintain database historical audit trails for existing transactions.
5. **Strict Positive Amounts**: Restricts debt and payment transaction amounts to strictly positive numbers.
6. **Robust Transaction Isolation**: Creates shops and logs transactions within database-level isolation blocks (`prisma.$transaction()`).

---

## 🛠️ Tech Stack

* **Core**: Node.js & Express.js
* **Database & ORM**: PostgreSQL & Prisma ORM
* **Security & Middleware**: JWT authentication, bcryptjs, Helmet, CORS, Morgan, Zod validation

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory. Below are the required environment variables:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:kali@localhost:5432/shop_debt_db?schema=public"
JWT_SECRET="super-secret-jwt-key-for-shop-debt-management-system-2026"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
```

### 📋 Environment Variables Details

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection URL containing database credentials and host details. | `postgresql://postgres:password@localhost:5432/shop_debt_db?schema=public` |
| `JWT_SECRET` | Secret key used for signing and verifying authorization JWT tokens. | `super-secret-jwt-key-for-shop-debt-management-system-2026` |
| `JWT_EXPIRES_IN` | Token expiration duration format. | `7d` |
| `PORT` | Local server listener port. | `5000` |
| `FRONTEND_URL` | The permitted frontend location for CORS requests. | `http://localhost:5173` |
| `NODE_ENV` | Mode under which the Express application runs (`development`, `production`). | `development` |

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Apply Migrations & Generate Client
```bash
npx prisma migrate dev --name init
```

### 3. Seed Mock Data
```bash
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```
The server will start listening at `http://localhost:5000`.

---

## 🧪 Running Integration Tests

To run the automated endpoint validation suite:
```bash
node scratch/test-endpoints.js
```
*(Tests require node v18+ and a local PostgreSQL connection).*

---

## 🔑 Test Accounts (Seed Data)

| Role | Phone | Password | Shop Name | Subscription Status |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `+22236124567` | `Admin123456` | *Global* | *Global* |
| **Shop Owner 1** | `+22222103344` | `Shop123456` | بقالة الأمانة | **ACTIVE** (Expires in 30d) |
| **Shop Owner 2** | `+22245789012` | `Shop123456` | متجر النور | **EXPIRING_SOON** (Expires in 3d) |
| **Shop Owner 3** | `+22240312211` | `Shop123456` | محل أهل المختار | **EXPIRED** (Expired 5d ago) |
| **Shop Owner 4** | `+22236601175` | `Shop123456` | سوبر ماركت الساحل | **SUSPENDED** (Suspended status) |

---

## 📚 API Endpoints

### Auth (`/api/auth`)
* `POST /login` - Public login page. Returns user details & token.
* `GET /me` - Protected. Returns profile info.

### Super Admin (`/api/admin`)
* `GET /shops` - Lists all shops.
* `POST /shops` - Onboards a shop, owner user, and default WhatsApp setting.
* `GET /shops/:id` - Shop details.
* `PUT /shops/:id` - Updates shop profile info.
* `PATCH /shops/:id/suspend` - Suspends shop.
* `PATCH /shops/:id/activate` - Re-activates shop.
* `POST /shops/:id/extend-subscription` - Extends subscription (addDays, addMonths, addYears, or customDate).
* `GET /dashboard` - Admin dashboard analytics.
* `GET /shops-expiring` - Lists shops expiring in <= 5 days.
* `GET /shops-expired` - Lists expired shops.

### Shop Owner (`/api/shop`)
* `GET /dashboard` - Dashboard analytics (customers counts, debtors, creditors, outstanding debts).
* `GET /customers` - Lists active customers and running balances.
* `POST /customers` - Adds a customer.
* `GET /customers/:id` - Customer profile.
* `PUT /customers/:id` - Updates customer profile.
* `DELETE /customers/:id` - Soft deletes a customer.
* `GET /customers/:customerId/transactions` - Lists customer ledger.
* `POST /customers/:customerId/debts` - Registers a debt.
* `POST /customers/:customerId/payments` - Registers a payment.
* `GET /whatsapp/settings` - Retrieves WhatsApp parameters.
* `PUT /whatsapp/settings` - Modifies settings.

---

## 📬 Postman Collection

Import `shop-debt-management-system.postman_collection.json` located in the root of the project to view, test, and document all APIs in Postman.

---

## 🏗️ Production Deployment Notes

When deploying the Shop Debt Management System backend in a production environment:

1. **Database Migrations**: 
   - Never run `prisma migrate dev` in production. Instead, run `npx prisma migrate deploy` to safely apply migrations to the production database.
   - Run `npx prisma generate` during the build step to ensure the production package imports the correct Prisma client.
2. **Environment Variables**:
   - Ensure `NODE_ENV` is set to `production` to disable developer warnings and enable optimized production logging.
   - Change `JWT_SECRET` to a long, cryptographically secure random string.
   - Restrict `FRONTEND_URL` to the exact host domain of the production frontend app (do not leave it as `localhost`).
3. **CORS Lockdown**:
   - CORS is locked down to `FRONTEND_URL`. Verify the client app domain matches `FRONTEND_URL` exactly.
4. **Security Hardening**:
   - Helmet headers are enabled by default. Ensure your hosting proxy (e.g. Nginx) is configured to handle reverse-proxy header forwarding (`trust proxy` in Express if required).
5. **Process Management**:
   - Use a production-grade process manager such as `pm2` to handle automatic crash restarts and cluster scaling:
     ```bash
     npm install -g pm2
     pm2 start src/server.js --name "shop-debt-backend"
     ```
