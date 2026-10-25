> 🌐 **Full-Stack Quick Navigation:**
> - 💻 **Frontend Web Portal (Repository):** [https://github.com/Condominium-Management-System/React-Frontend](https://github.com/Condominium-Management-System/React-Frontend)
> - 🚀 **Live Deployed Application:** [https://homeaxiz.vercel.app](https://homeaxiz.vercel.app)
> - ⚙️ **Backend API (Repository):** [https://github.com/Condominium-Management-System/backend](https://github.com/Condominium-Management-System/backend)

---

# HomeAxis Backend API — Enterprise Condominium Management System

A production-grade, multi-tenant REST API powering the **HomeAxis Condominium Management Platform**, built with Node.js, Express.js (ES Modules), PostgreSQL, Prisma ORM, JWT-based Role-Based Access Control (RBAC), and real-time Socket.IO communication.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time-010101?logo=socket.io&logoColor=white)](https://socket.io/)

---

## 📑 Table of Contents
- [📌 Overview](#-overview)
- [🔗 Ecosystem & Project Resources](#-ecosystem--project-resources)
- [👥 User Roles & Access Architecture](#-user-roles--access-architecture)
- [✨ Core Features](#-core-features)
- [🛠️ Technology Stack](#%EF%B8%8F-technology-stack)
- [📂 Project Structure](#-project-structure)
- [🏗️ System Architecture](#%EF%B8%8F-system-architecture)
- [1️⃣ Clone the Repository](#1%EF%B8%8F%E2%83%A3-clone-the-repository)
- [2️⃣ Install Dependencies](#2%EF%B8%8F%E2%83%A3-install-dependencies)
- [⚙️ Environment Configuration](#%EF%B8%8F-environment-configuration)
- [🗃️ Database Setup & Prisma ORM](#%EF%B8%8F-database-setup--prisma-orm)
- [🌱 Database Seeding (5 Condominiums)](#-database-seeding-5-condominiums)
- [▶️ Running the Application](#%EF%B8%8F-running-the-application)
- [📚 Comprehensive API Documentation & Endpoints](#-comprehensive-api-documentation--endpoints)
- [🔒 Security & Business Rules](#-security--business-rules)
- [🧠 Key Design Decisions](#-key-design-decisions)
- [🔮 Future Enhancements](#-future-enhancements)
- [📌 Assumptions and Known Limitations](#-assumptions-and-known-limitations)
- [👨‍💻 Authors & Lead Engineers](#-authors--lead-engineers)

---

## 📌 Overview
The **HomeAxis Backend API** is an enterprise-grade backend system designed specifically for residential condominium communities in Ethiopia. It merges automated financial accounting with long-standing Ethiopian cultural institutions—specifically **Equb** (rotating savings pools) and **Iddir** (mutual aid assistance).

### The Problems Solved:
1. **Manual Account Entry & Payment Errors**: Historically, residents had to manually remember or input condominium bank account numbers when paying monthly dues. HomeAxis introduces **Automated Treasury Routing**, resolving the condominium's active Commercial Bank of Ethiopia (CBE) or Telebirr account on the server side automatically.
2. **Multi-Tenant Data Leaks**: Condominiums operating on shared platforms frequently risk data bleed. HomeAxis enforces **strict data scoping**, locking Condominium Administrators to their assigned condominium code via verified JWT tokens.
3. **Digitizing Equb & Iddir**: Traditional Equbs and Iddirs operate on physical paper ledgers. HomeAxis provides verifiable contribution tracking, randomized round lotteries, winner payouts, and bereavement/emergency claims processing.
4. **Financial Transparency**: Built-in double-entry accounting guarantees an immutable ledger (`Transaction`) linking payer accounts, condominium operational accounts, and transaction reference numbers.

---

## 🔗 Ecosystem & Project Resources
| Resource | URL | Description |
|:---|:---|:---|
| **Live Deployed Web Application** | [https://homeaxiz.vercel.app](https://homeaxiz.vercel.app) | Production web portal (Frontend) |
| **Frontend GitHub Repository** | [Condominium-Management-System/React-Frontend](https://github.com/Condominium-Management-System/React-Frontend) | React 18 single-page application |
| **Backend GitHub Repository** | [Condominium-Management-System/backend](https://github.com/Condominium-Management-System/backend) | Express.js & PostgreSQL REST API |
| **Local API Base URL** | `http://127.0.0.1:3000/api` | Local API server runtime endpoint |

---

## 👥 User Roles & Access Architecture
The application governs access through strict Role-Based Access Control (RBAC):

1. 👑 **Super Administrator (`super_admin`)**:
   - Oversees nationwide condominium operations across all regions and cities.
   - Registers new condominium complexes and creates initial condominium administrators.
   - Monitors aggregated revenue performance and total operational reserves across all registered accounts.
   - Broadcasts nationwide platform notices.

2. 🏢 **Condominium Administrator (`condo_admin`)**:
   - Manages building blocks, apartment rooms, and resident occupancy within their assigned condominium.
   - Registers and manages condominium operational source/destination accounts (CBE, Telebirr).
   - Approves or rejects resident condominium fee submissions, automatically crediting the treasury.
   - Oversees community Equb rounds, conducts winner selection, and disburses payouts.
   - Reviews emergency and bereavement claims submitted to the condominium's Iddir society.

3. 🏡 **Resident (`resident`)**:
   - Accesses a mobile-friendly dashboard detailing verified contributions and membership statuses.
   - Submits monthly condominium dues with automatic destination account resolution.
   - Configures personal payout accounts (CBE or Telebirr) to receive Equb lottery winnings and Iddir aid.
   - Participates in Equb rotating credit rounds and applies for emergency mutual aid assistance.
   - Reports maintenance issues, trades on the marketplace, and reviews community notices.

4. 🛡️ **Security Guard (`guard`)**:
   - Verifies guest and vehicle gate clearance.
   - Accesses building notices, logs incident reports, and handles lost & found property records.

---

## ✨ Core Features
- **Strict Multi-Condominium Isolation**: Condo Admins can only view and update records matching their assigned `condoId`. Cross-tenant mutations trigger `403 Forbidden`.
- **Automated Treasury Payment Routing**: When a resident pays, the system identifies the resident's condominium from server-side session data and automatically links the eligible active destination account.
- **Zero-Balance Simulator**: Enables seamless end-to-end testing of payments and payouts without artificial internal user balance locks by simulating external banking transactions (CBE, Telebirr).
- **Digital Equb Rotating Savings**: Round-by-round payment tracking, verified collection calculations, fair winner selection, and treasury disbursements.
- **Digital Iddir Mutual Aid**: Automated member dues verification, emergency assistance requests, and administrative claim disbursements.
- **Auditable Double-Entry Ledger**: Permanent ledger records linking payer accounts, receiver accounts, fee percentages, and reference codes.
- **Real-Time WebSockets**: Instant updates for chat discussions, emergency alerts, and administrative notifications via Socket.IO.

---

## 🛠️ Technology Stack
| Technology | Purpose |
|:---|:---|
| [Node.js](https://nodejs.org/) (v18+) | JavaScript runtime environment |
| [Express.js](https://expressjs.com/) (v4.x) | Web API framework (ES Modules) |
| [PostgreSQL](https://www.postgresql.org/) | ACID-compliant relational database |
| [Prisma ORM](https://www.prisma.io/) (v6.x) | Schema migrations, declarative relationships, and query builder |
| [JWT](https://jwt.io/) (`jsonwebtoken`) | Stateless bearer access and refresh token authentication |
| [bcryptjs](https://www.npmjs.com/package/bcryptjs) | Salted password hashing (10 rounds) |
| [Joi](https://joi.dev/) | Strict request payload validation |
| [Socket.IO](https://socket.io/) | Full-duplex WebSocket messaging and notifications |
| [Multer](https://github.com/expressjs/multer) | Multipart file and photo upload handling |

---

## 📂 Project Structure
```
backend/
├── config/
│   ├── prisma.config.js       # Prisma client instance
│   └── roles.config.js        # RBAC role definitions
├── controllers/
│   ├── admin.controller.js    # Super Admin system-wide governance
│   ├── auth.controller.js     # User registration, login, token refresh, and profile
│   ├── condo.controller.js    # Condominium directory, blocks, and units
│   ├── condoAccount.controller.js # Condominium bank and Telebirr treasury accounts
│   ├── equb.controller.js     # Rotating savings groups, cycles, rounds, and payouts
│   ├── iddir.controller.js    # Mutual aid societies, dues, and emergency claims
│   ├── payment.controller.js  # Resident dues submissions, approvals, and fee routing
│   ├── transaction.controller.js # Double-entry audited ledger transaction logs
│   ├── userAccount.controller.js # Resident personal payout destination accounts
│   ├── report.controller.js   # Incident tickets and staff responses
│   ├── announcement.controller.js # Emergency notices and broadcasts
│   ├── promotion.controller.js# Marketplace advertisements
│   └── lostFound.controller.js# Lost and found property management
├── middleware/
│   ├── auth.middleware.js     # JWT bearer token verification
│   ├── role.middleware.js     # RBAC role authorization check
│   └── upload.middleware.js   # Multer file and image attachment handling
├── routes/
│   ├── auth.route.js          # Authentication and profile routes
│   ├── condo.route.js         # Public condo directory & admin management
│   ├── condoAccount.route.js  # Condominium treasury accounts
│   ├── equb.route.js          # Equb savings lifecycle endpoints
│   ├── iddir.route.js         # Iddir mutual aid endpoints
│   ├── payment.route.js       # Payments, verification, and statistics
│   ├── transaction.route.js   # Audited ledger records
│   ├── userAccount.route.js   # Resident payout accounts
│   ├── report.routes.js       # Maintenance tickets and reports
│   ├── announcement.route.js  # Notice board and announcements
│   ├── promotion.route.js     # Business promotions
│   └── lostFound.route.js     # Lost & found listings
├── services/                  # Core domain logic, scoping, and transactions
├── prisma/
│   ├── schema.prisma          # PostgreSQL relational schema definitions
│   └── seed.js                # 5 Condominiums full production database seeder
├── .env                       # Environment configuration
├── package.json               # Dependencies and run scripts
└── server.js                  # HTTP server & WebSocket bootstrap
```

---

## 🏗️ System Architecture
```
┌────────────────────────────────────────────────────────┐
│             Client Applications (Web & Mobile)         │
│           React Frontend (https://homeaxiz.vercel.app) │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP Bearer Token / WebSocket
                            ▼
┌────────────────────────────────────────────────────────┐
│                  Express.js Gateway                    │
│   Rate Limiting • CORS • Request Parsing • Logging     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                 Middleware Layer                       │
│    authenticate (JWT)  •  authorizeRoles (RBAC)        │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                 Controller Layer                       │
│     Request Sanitization • DTO / Joi Validation        │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                  Service Layer                         │
│  Multi-Tenant Scoping • Payment Routing • Equb/Iddir   │
│         Zero-Balance Simulator • Ledger Engine         │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                 Prisma ORM Layer                       │
│   Strongly-Typed Queries • Cascade Rules • Relations   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             PostgreSQL Relational Database             │
│   5 Condominiums • Treasury Accounts • Ledgers • Users │
└────────────────────────────────────────────────────────┘
```

---

## 1️⃣ Clone the Repository
```bash
git clone https://github.com/Condominium-Management-System/backend.git
cd backend
```

## 2️⃣ Install Dependencies
```bash
npm install
```

---

## ⚙️ Environment Configuration
Create a `.env` file in the project root:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/homeaxis_db?schema=public"

# JWT Authentication Secrets
ACCESS_TOKEN_SECRET="your-secure-access-token-secret-at-least-32-chars"
REFRESH_TOKEN_SECRET="your-secure-refresh-token-secret-at-least-32-chars"
ACCESS_TOKEN_EXPIRY="15m"
REFRESH_TOKEN_EXPIRY="7d"

# CORS Configuration
CORS_ORIGIN="http://localhost:3000,https://homeaxiz.vercel.app"
```

---

## 🗃️ Database Setup & Prisma ORM
Initialize the Prisma client and apply schema migrations to PostgreSQL:

```bash
# Generate the Prisma client
npx prisma generate

# Apply migrations
npx prisma migrate deploy
```

---

## 🌱 Database Seeding (5 Condominiums)
The backend provides a complete relational seeder that sets up **5 distinct Ethiopian condominiums** with building blocks, rooms, admins, guards, residents, treasury accounts, Equb savings groups with past payouts, and Iddir societies:

```bash
npm run prisma:seed
```

### Configured Condominium Complexes:
1. **Bole Medhanialem Luxury Condominium** (`HX-5218`) — Bole, Addis Ababa
2. **CMC Sunshine Heights Village** (`HX-6655`) — CMC Michael, Addis Ababa
3. **Sarbet Diplomatic Residences** (`HX-7120`) — Sarbet, Addis Ababa
4. **Kazanchis Executive Towers** (`HX-8430`) — Kazanchis, Addis Ababa
5. **Gerji Imperial Community** (`HX-9510`) — Gerji, Addis Ababa

---

## ▶️ Running the Application

### Development Mode (with hot-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```
The server starts listening on `http://127.0.0.1:3000/api`.

---

## 📚 Comprehensive API Documentation & Endpoints

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|:---|:---|:---|:---|
| `POST` | `/api/auth/register` | Register new resident account | Public |
| `POST` | `/api/auth/login` | Authenticate user and obtain JWT tokens | Public |
| `POST` | `/api/auth/refresh-token` | Rotate refresh token for a fresh access token | Public |
| `GET` | `/api/auth/me` | Retrieve authenticated user profile | Authenticated |
| `POST` | `/api/auth/logout` | Revoke session and invalidate tokens | Authenticated |

### 🏢 Condominiums (`/api/condos`)
| Method | Endpoint | Description | Access |
|:---|:---|:---|:---|
| `GET` | `/api/condos` | Public condominium directory lookup | Public |
| `GET` | `/api/condos/search` | Search condominiums by name or code | Public |
| `POST` | `/api/condos` | Create new condominium complex | Super Admin |
| `GET` | `/api/condos/:id` | Get condominium details with blocks & units | Authenticated |
| `PATCH`| `/api/condos/:id` | Update condominium information | Super Admin |

### 🏦 Condominium Treasury Accounts (`/api/condo-accounts`)
| Method | Endpoint | Description | Access |
|:---|:---|:---|:---|
| `GET` | `/api/condo-accounts` | List condominium accounts (scoped to condo) | Admin |
| `POST` | `/api/condo-accounts` | Register source/destination account (CBE, Telebirr) | Admin |
| `GET` | `/api/condo-accounts/:id` | Get account details & current balance | Admin |
| `PATCH`| `/api/condo-accounts/:id` | Update account details (scoped with 403 check) | Admin |
| `PATCH`| `/api/condo-accounts/:id/default`| Set primary account for automated fee routing | Admin |
| `DELETE`| `/api/condo-accounts/:id`| Deactivate/archive account | Admin |

### 💳 Resident Payout Destination Accounts (`/api/accounts`)
| Method | Endpoint | Description | Access |
|:---|:---|:---|:---|
| `GET` | `/api/accounts` | Get authenticated resident's saved payout accounts | Resident |
| `POST` | `/api/accounts` | Register payout account (CBE, Telebirr) | Resident |
| `GET` | `/api/accounts/:id` | Get specific payout account | Resident |
| `PATCH`| `/api/accounts/:id/default`| Set account as primary payout destination | Resident |
| `DELETE`| `/api/accounts/:id`| Remove payout destination account | Resident |

### 💰 Payments & Revenue (`/api/payments`)
| Method | Endpoint | Description | Access |
|:---|:---|:---|:---|
| `POST` | `/api/payments` | Submit fee payment (auto-routes to condo treasury) | Resident |
| `GET` | `/api/payments/my` | Get resident personal payment history | Resident |
| `GET` | `/api/payments` | Get payment approval queue | Admin |
| `PATCH`| `/api/payments/:id/approve` | Approve payment, credit treasury, update ledger | Admin |
| `PATCH`| `/api/payments/:id/reject` | Reject payment with administrative feedback | Admin |
| `GET` | `/api/payments/statistics` | System-wide collected volume & revenue totals | Super Admin |

### 🤝 Equb Rotating Savings (`/api/equbs`)
| Method | Endpoint | Description | Access |
|:---|:---|:---|:---|
| `GET` | `/api/equbs` | List Equb groups (Super: all; Condo Admin: own) | Admin |
| `GET` | `/api/equbs/my` | Get resident enrolled Equb groups & rounds | Resident |
| `POST` | `/api/equbs/:id/join` | Request enrollment into Equb group | Resident |
| `POST` | `/api/equbs/:id/payout` | Select round winner & disburse treasury funds | Condo Admin |

### 🤝 Iddir Mutual Aid Society (`/api/iddirs`)
| Method | Endpoint | Description | Access |
|:---|:---|:---|:---|
| `GET` | `/api/iddirs` | List active Iddir aid groups | Admin |
| `GET` | `/api/iddirs/my` | Get resident enrolled Iddir society | Resident |
| `POST` | `/api/iddirs/:id/join` | Apply for Iddir community membership | Resident |
| `POST` | `/api/iddirs/:id/claims` | File emergency/bereavement assistance claim | Resident |
| `GET` | `/api/iddirs/my-claims` | Get resident submitted claims & statuses | Resident |

### 📢 Community & Communications
| Method | Endpoint | Description | Access |
|:---|:---|:---|:---|
| `GET` | `/api/announcements` | Get pinned notices and community broadcasts | Authenticated |
| `POST` | `/api/announcements` | Publish condominium announcement | Admin |
| `GET` | `/api/promotions` | Get marketplace promotions | Authenticated |
| `POST` | `/api/promotions` | Submit promotion advertisement | Resident/Admin |
| `GET` | `/api/lost-found` | Get lost and found property items | Authenticated |
| `POST` | `/api/lost-found` | Report found property or claimed item | Authenticated |
| `GET` | `/api/reports` | Get maintenance tickets and incident reports | Authenticated |
| `POST` | `/api/reports` | Submit incident report or maintenance ticket | Resident |

---

## 🔒 Security & Business Rules
1. **Multi-Tenant Data Scoping**: All queries from Condo Administrators enforce `WHERE condoId = requester.condoId`. Attempts to view or mutate another condominium's data return `403 Forbidden`.
2. **Automated Destination Routing**: Resident payments retrieve the condominium's currently active destination account on the server side, ensuring money routes correctly without resident error.
3. **Verified Contribution Integrity**: Unverified, pending, or rejected payments are strictly excluded from verified contribution sums and Equb winner lottery eligibility.
4. **Double-Entry Financial Auditing**: Mutations record permanent ledger entries linking sender accounts, recipient accounts, payment types, and reference stamps.
5. **Zero-Balance Simulator**: Eliminates artificial internal user balance locks by simulating direct Ethiopian banking infrastructure (CBE, Telebirr).

---

## 🧠 Key Design Decisions
- **Prisma ORM with PostgreSQL**: Provides declarative database schema modeling, strongly-typed query execution, automatic relation cascading, and safe migrations.
- **Service-Based Architecture**: Business logic is decoupled from HTTP handlers into testable services (`services/*.service.js`), simplifying debugging and integration testing.
- **Double-Entry Ledger (`Transaction`)**: Ensures every financial movement (resident payments, admin payouts, service fees) is permanently auditable.

---

## 🔮 Future Enhancements
- Direct CBE Birr and Telebirr Open API integration with automated webhooks.
- Multi-factor authentication (MFA) via SMS OTP for high-value payouts.
- Automated monthly recurring invoices and PDF receipt generation.
- Full Docker containerization with docker-compose.

---

## 📌 Assumptions and Known Limitations
- External banking providers (CBE and Telebirr) are currently handled via the Zero-Balance Simulator engine.
- Resident payout accounts require administrative approval before receiving automated disbursements.
- File and photo uploads use local multipart disk storage or Cloudinary when configured.

---

## 👨‍💻 Authors & Lead Engineers

| Role | Engineer |  |
|:---|:---|:---|
| **Backend Lead Engineer** | **Shanbel Dires** | 
| **Frontend Lead Engineer**| **Singiten Beshada** |
| **UI/UX Designer** | **Saron Tesfahun** | 

---

## 📄 License
Proprietary software developed for the HomeAxis Condominium Management System. All rights reserved.
