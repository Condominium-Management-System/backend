# HomeAxis Backend — Enterprise Condominium Management System

Production-grade Express.js & Node.js backend powering the **HomeAxis Condominium Management System**, built with PostgreSQL, Prisma ORM, JWT-based Role-Based Access Control (RBAC), and real-time Socket.IO communication.

---

## 🏛️ Project Architecture & Highlights

- **Multi-Condominium Isolation**: Strict tenant scoping isolating condominium operations, bank accounts, residents, and ledgers per condominium, overseen globally by the Super Administrator.
- **Automated Treasury & Destination Routing**: Smart payment destination matching that automatically resolves condominium accounts and credits operational reserves upon admin approval.
- **Zero-Balance Simulator**: Real-time internal ledger simulation enabling frictionless resident CBE / Telebirr payment submissions without artificial balance restrictions.
- **Traditional Ethiopian Community Systems**: Full digital lifecycle management for Rotating Savings (**Equb**) and Mutual Aid (**Iddir**), complete with verified contribution tracking, claims processing, and payout management.
- **Auditable Ledger**: Immutable double-entry transaction records linking source/destination user accounts and condominium operational treasury accounts.

---

## 🛠️ Technology Stack

| Layer | Technology |
|:---|:---|
| **Runtime & Framework** | Node.js (v18+) / Express.js (ES Modules) |
| **Database & ORM** | PostgreSQL / Prisma ORM |
| **Authentication** | JSON Web Tokens (JWT) / bcryptjs (10-12 rounds) |
| **Input Validation** | Joi Validation Schemas |
| **Real-Time WebSockets**| Socket.IO |
| **Storage & Uploads** | Multer (Local & Cloud storage integration) |

---

## 👥 Authors & Lead Engineers

| Role | Engineer | Contact & Profiles |
|:---|:---|:---|
| **Backend Lead Engineer** | **Shanbel Dires** | [shanbeldires7@gmail.com](mailto:shanbeldires7@gmail.com) |
| **Frontend Lead Engineer**| **Singiten Beshada** | [singiten2127@gmail.com](mailto:singiten2127@gmail.com) • [GitHub: @singiten](https://github.com/singiten) |

---

## ⚙️ Environment Configuration

Create a `.env` file in `express backend/backend/` with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/homeaxis_db?schema=public"

# JWT Authentication Secrets
ACCESS_TOKEN_SECRET="your-super-strong-access-token-secret"
REFRESH_TOKEN_SECRET="your-super-strong-refresh-token-secret"
ACCESS_TOKEN_EXPIRY="15m"
REFRESH_TOKEN_EXPIRY="7d"

# Initial Super Admin Provisioning (Used during seeding)
SUPERADMIN_EMAIL="superadmin@yekondominium.com"
SUPERADMIN_PASSWORD="YourSecurePassword123!"

# CORS Allowed Origins
CORS_ORIGIN="http://localhost:3000,http://localhost:3001"
```

---

## 🚀 Getting Started & Installation

### 1. Install Dependencies
```bash
cd "express backend/backend"
npm install
```

### 2. Database Migrations & Prisma Client
```bash
npx prisma generate
npx prisma migrate deploy
```

### 3. Production Database Seeding
Initializes the System Super Administrator and HomeAxis System Treasury Account (`HX-SYS-001`):
```bash
npm run prisma:seed
```

### 4. Start the Server
```bash
# Production mode
npm start

# Development mode (with nodemon)
npm run dev
```
The server will start on `http://127.0.0.1:3000`.

---

## 📖 API Documentation & Route Catalog

### 🔐 Authentication & Profile (`/api/auth`, `/api/users`)
- `POST /api/auth/register` — Register new user account.
- `POST /api/auth/login` — Authenticate user and receive JWT access token.
- `POST /api/auth/refresh-token` — Rotate and obtain fresh access token.
- `GET /api/users/me` — Retrieve authenticated user profile.
- `GET /api/users/me/full-profile` — Retrieve full profile with verified contributions, Equb/Iddir memberships, financial summaries, and payout destination.
- `GET /api/users` — List all registered users (Admin only).

### 🏢 Condominium Management (`/api/condos`)
- `GET /api/condos` — List all condominiums (Super Admin: all; Condo Admin: own).
- `POST /api/condos` — Register new condominium (Super Admin).
- `GET /api/condos/:id` — Retrieve condominium details, blocks, and occupancy.
- `PUT /api/condos/:id` — Update condominium profile and rules.

### 🏦 Condominium Treasury & Accounts (`/api/condo-accounts`)
- `GET /api/condo-accounts` — List accounts (Super Admin: system-wide with condo attribution; Condo Admin: scoped strictly to assigned condo).
- `POST /api/condo-accounts` — Register source/destination account (CBE, Telebirr, etc.).
- `GET /api/condo-accounts/:id` — Get account details.
- `PUT /api/condo-accounts/:id` & `PATCH /api/condo-accounts/:id` — Update account details (Scoped with 403 Forbidden protection).
- `PATCH /api/condo-accounts/:id/default` — Set primary default account for automatic resident routing.
- `DELETE /api/condo-accounts/:id` — Archive / deactivate condominium account.

### 💳 Payments & Transactions (`/api/payments`, `/api/transactions`)
- `POST /api/payments` — Submit payment (service charge, guard fee, Equb, Iddir). Automatically resolves destination condo account and applies 0-balance simulator rule.
- `GET /api/payments/my-payments` — Resident payment history with approval statuses.
- `GET /api/payments` — Admin payment queue with status and type filters.
- `PATCH /api/payments/:id/approve` — Approve payment, credit condominium operational account, increment verified totals, and complete ledger transaction.
- `PATCH /api/payments/:id/reject` — Reject payment with mandatory administrative notes.
- `GET /api/payments/statistics` — Super Admin system-wide revenue and collected volume aggregation.
- `GET /api/transactions` — Ledger transactions filterable by `condoAccountId`, `status`, `paymentType`, and date ranges.

### 🤝 Equb & Iddir Mutual Aid (`/api/equbs`, `/api/iddirs`)
- `GET /api/equbs` & `GET /api/iddirs` — List rotating savings and mutual aid groups.
- `POST /api/equbs` & `POST /api/iddirs` — Create groups with contribution cycle rules.
- `POST /api/equbs/:id/join` & `POST /api/iddirs/:id/join` — Request group membership.
- `PATCH /api/equbs/:id/members/:userId/status` — Approve/reject membership.
- `POST /api/equbs/:id/payout` — Issue winner payout and record treasury disbursement.
- `POST /api/iddirs/:id/claims` — File emergency assistance claim.

### 📢 Community & Communications
- **Announcements** (`/api/announcements`): Broadcast emergency and general notices.
- **Promotions** (`/api/promotions`): Marketplace advertising with approval workflow.
- **Lost & Found** (`/api/lost-found`): Item reporting, claiming, and verification.
- **Reports & Tickets** (`/api/reports`): Maintenance requests, incident reports, and join requests.
- **Chat** (`/api/chat`): Real-time condominium resident and administration messaging.

---

## 🔒 Security & Business Rules

1. **Condominium Data Isolation**: Queries performed by Condo Admins automatically enforce `WHERE condoId = currentUser.condoId`. Cross-condo access attempts return `403 Forbidden`.
2. **Zero-Balance Simulator**: Resident payment and contribution submissions simulate external bank transfers (CBE, Telebirr) and are never rejected due to internal user balance.
3. **Double-Entry Auditing**: Transactions maintain immutable references (`senderCondoAccountId`, `receiverCondoAccountId`, `hxAccountId`, reference stamp) ensuring verifiable financial tracking.
4. **Verified Contribution Rules**: Unverified, pending, or rejected payments never count toward verified Equb or Iddir balances or payout eligibility until approved by an authorized administrator.

---

## 📄 License
Proprietary software for HomeAxis Condominium Management System. All rights reserved.
