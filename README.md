# 🏭 Swagat Industries ERP & Quotation Management System

A production-grade, full-stack Enterprise Resource Planning (ERP) and Quotation Management System tailored specifically for **Swagat Industries**, specializing in Rolling Shutter Manufacturing, Multi-Site Installation Tracking, Technical Dimension Math Engine, PDF Generation, Payment Ledger Management, and Invite-Based User Administration.

---

## 📋 Overview & Purpose

Swagat Industries ERP streamlines end-to-end industrial manufacturing workflows from user onboarding to customer profile management, technical quotation generation, PDF exports, and payment reconciliation. The application enforces a clean hierarchical relational data model:

$$\text{User / Invite} \longrightarrow \text{Customer} \longrightarrow \text{Industry / Company} \longrightarrow \text{Installation Site} \longrightarrow \text{Rolling Shutter Catalog} \longrightarrow \text{Quotation} \longrightarrow \text{Payments}$$

---

## 🔄 Complete Application Flow

The system guides administrators through an integrated operational workflow:

```mermaid
flowchart LR
    A["🔐 1. Login / Invite Auth"] --> B["📊 2. Executive Dashboard"]
    B --> C["👤 3. User Management"]
    B --> D["👥 4. Customers"]
    D --> E["🏢 5. Industries"]
    E --> F["📍 6. Sites"]
    F --> G["🚪 7. Shutters Catalog"]
    G --> H["📜 8. Quotations Engine"]
    H --> I["💳 9. Payments & Receipts"]
    H --> J["🖨️ 10. Printable PDF"]
```

---

## 🚀 Key Feature Highlights

- **📩 Invite-Based User Registration**: Administrators can invite team members via 6-digit email invitation codes. Invited users register their account seamlessly via the login portal.
- **🔐 Streamlined Fast Login**: Simplified authentication experience with immediate dashboard redirect, JWT persistence, bcrypt password hashing, and full self-service password recovery.
- **🔑 Username & Email Forgot Password Recovery**: Recovery wizard accepts either registered Username or Email ID. Sends 6-digit OTP codes via SMTP with 15-minute expiration timers and explicit account validation error messages (*"Account not found. Please check entered username or email ID."*).
- **👤 Top-Right Navbar Profile & User Directory**: Access User Management directly from the top-right profile dropdown showing Full Name on top and `@username` on the sub-line. Features user creation, profile editing, invitation cancellation, and password visibility toggles (`FiEye` / `FiEyeOff`).
- **📅 Standardized Global Date Format (`DD/MM/YYYY`)**: All date fields across user tables, customer logs, payment histories, quotation lists, and PDF receipts follow clean `DD/MM/YYYY` formatting (*e.g., 19/09/2026*).
- **🖨️ Printable Payment Receipt Slips (`PaymentSlipModal`)**: High-fidelity A4 printable voucher featuring Swagat letterhead, unique receipt numbers (`REC-XXXXX`), payment method details, amount formatted in Indian Rupee words (*e.g., Rupees Ten Thousand Only*), quotation balance summary, payment status badge (*FULLY PAID* / *PARTIALLY PAID*), and one-click WhatsApp sharing.
- **📐 Rolling Shutter Technical Math Engine**: Automated Sq.Ft calculation based on Height and Width in inches with drive mechanism allowances (**Manual**, **Gear**, **Motorised**), GI Cover calculations, and live calculation preview.

---

## 📸 Application Screenshots & Module Walkthrough

### 🔐 1. Authentication & Security (`01-auth/`)

The authentication module features enterprise Swagat Industries branding, JWT token persistence, bcrypt password hashing, automatic post-login dashboard navigation, invite-code account activation, and complete self-service password recovery workflows.

#### Features & Capabilities
- **Streamlined Fast Login**: High-performance login interface with instant dashboard navigation.
- **Forgot Password & OTP Recovery**: Integrated email notification system dispatching 6-digit OTP verification codes via SMTP with 15-minute expiration timers. Accepts both registered Username and Email ID.
- **Admin Recovery Assistance Box**: Embedded guidance card within the Forgot Password modal assisting users who forgot both credentials to contact their ERP Administrator for User Management lookup (`/users`).
- **Invite Code Registration**: Self-registration modal for invited users using their email and 6-digit invitation code.
- **Always-Redirect Dashboard Navigation**: Preserved state navigation routing users directly to the Executive Dashboard upon successful authentication.

#### Login Screen
*Clean, enterprise login interface with username, password, password visibility toggle, forgot password link, and invitation code registration link.*
![Login Screen](./FE/public/screenshots/01-auth/login.png)

#### Login Validation & Error Handling
*Real-time validation badges displaying error alerts for invalid credentials or unverified accounts.*
![Login Validation](./FE/public/screenshots/01-auth/login-validation.png)

#### Forgot Password & OTP Recovery Modal
*Self-service 3-step password recovery wizard with username/email input, 6-digit OTP verification code, secure password updating, and embedded Admin Recovery Assistance Card.*
![Forgot Password Modal](./FE/public/screenshots/01-auth/forgot-password-modal.png)

#### Invite Code Self-Registration Modal
*Self-service account registration modal allowing invited team members to verify their 6-digit invitation code and complete account setup.*
![Invite Registration Modal](./FE/public/screenshots/01-auth/invite-modal.png)

---

### 👤 2. User Management & Invitations (`02-users/`)

Centralized user directory accessible via the top-right profile dropdown menu (`/users`). Allows administrators to manage system users and send email invitations.

#### Features & Capabilities
- **Invite User Modal**: Send 6-digit invitation codes via SMTP email to new team members.
- **User Directory List**: Searchable table displaying Full Name, Username, Email, Created Date (`DD/MM/YYYY`), and Action buttons.
- **Edit User Modal**: Update user full name, email, username, or change password with live visibility toggles.
- **Cancel Invite**: Manage and revoke pending invitation codes.
- **Top-Right Profile Pill**: Navbar profile button displaying user's Full Name on top and `@username` underneath.

#### User Management Directory View
*Searchable user table displaying account details, formatted created dates (`DD/MM/YYYY`), pending invitations list, top-right navbar profile display, and user action buttons.*
![Users List](./FE/public/screenshots/02-users/users-list.png)

---

### 📊 3. Executive Dashboard (`03-dashboard/`)

Centralized operational hub displaying entity KPI counters, financial summary cards, live PostgreSQL database health indicator, and recent quotation streams.

#### Executive Dashboard Overview
*Dashboard featuring operational metrics (Customers, Industries, Sites, Shutters, Quotations), Total Billed Amount, Received Payments, and Outstanding Pending Balance.*
![Executive Dashboard](./FE/public/screenshots/02-dashboard/dashboard.png)

---

### 👥 4. Customer Management (`04-customers/`)

Centralized CRM module managing primary client profiles, contact numbers, billing addresses, and Indian GSTIN (15-character uppercase regex) keyup format validations.

#### Customers List View
*Searchable table listing customer profiles, mobile numbers, GST numbers, formatted created dates (`DD/MM/YYYY`), addresses, and linked industrial unit counts.*
![Customers List](./FE/public/screenshots/03-customers/customers-list.png)

#### Add Customer Modal
*Modal form for registering new customer profiles with real-time format validation indicators.*
![Add Customer Modal](./FE/public/screenshots/03-customers/customer-add.png)

#### Customer Form Data Entry
*Data entry form filled with test Gujarat customer details (`Shree Ganesh Engineering Pvt. Ltd.`).*
![Customer Data Entry](./FE/public/screenshots/03-customers/customer-filled.png)

#### Customer Details View Modal
*Detailed profile view modal displaying complete customer info, GSTIN status, and linked company units.*
![Customer View Details](./FE/public/screenshots/03-customers/customer-edit.png)

---

### 🏢 5. Industry / Company Management (`05-industries/`)

Multi-level corporate client management linking industrial units and subsidiary accounts directly under parent customer records.

#### Industries Directory List
*Searchable table displaying industrial accounts, parent customer names, contact persons, and site counts.*
![Industries List](./FE/public/screenshots/04-industries/industries-list.png)

#### Add Industry Modal
*Cascading dropdown modal for registering industrial units (`Shree Ganesh Engineering Unit`).*
![Add Industry Modal](./FE/public/screenshots/04-industries/industry-add.png)

---

### 📍 6. Site / Location Management (`06-sites/`)

Multi-location site tracking with city locations, site supervisors, contact numbers, installation remarks, and linked shutter catalog counts.

#### Sites List View
*Table displaying physical installation locations, city tags, site contacts, and shutter specifications.*
![Sites List](./FE/public/screenshots/05-sites/sites-list.png)

#### Add Site Modal
*Form modal for registering installation sites (`Vatva Manufacturing Plant`, Ahmedabad).*
![Add Site Modal](./FE/public/screenshots/05-sites/site-add.png)

---

### 🚪 7. Rolling Shutters Master Catalog & Math Engine (`07-shutters/`)

Technical shutter catalog supporting custom Height & Width inputs in inches, automatic Sq.Ft calculations, fitting types (**A Type** Guide Inside / **B Type** Guide Outside), and drive mechanisms (**Manual**, **Gear**, **Motorised**).

#### Shutters Catalog List
*Master catalog table displaying shutter dimensions, converted feet, drive mechanism badges, rate per sq.ft, and calculated total basic price.*
![Shutters List](./FE/public/screenshots/06-shutters/shutters-list.png)

#### Manual Shutter Specification
*Form modal specifying a Manual Shutter (`120" × 144"`, Height +1.50' & Width +0.50' allowances).*
![Manual Shutter](./FE/public/screenshots/06-shutters/shutter-manual.png)

#### Gear Shutter Specification
*Form modal specifying a Heavy Duty Gear Shutter (`144" × 180"`, Height +2.00' & Width +0.75' allowances, Gear Price ₹3,500).*
![Gear Shutter](./FE/public/screenshots/06-shutters/shutter-gear.png)

#### Motorised Shutter Specification
*Form modal specifying an Automated Motorised Shutter (`180" × 216"`, Motor Price ₹12,500).*
![Motorised Shutter](./FE/public/screenshots/06-shutters/shutter-motorised.png)

#### Live Shutter Calculation Preview
*Real-time live math calculation banner displaying Over Height, Over Width, Total Sq.Ft., GI Top Cover Size, Shutter Basic, and Item Basic Total.*
![Shutter Calculation Engine](./FE/public/screenshots/06-shutters/shutter-calculation.png)

---

### 📜 8. Quotation Engine (`08-quotations/`)

Automated quotation generator featuring cascading customer-industry-site selection, shutter snapshots, additional charges, transportation fees, configurable GST rates (0% to 28%), and discount handling.

#### Quotations List View
*Table listing generated quotations, quotation numbers, formatted dates (`DD/MM/YYYY`), customer details, total amounts, paid amounts, and pending balances.*
![Quotations List](./FE/public/screenshots/07-quotations/quotations-list.png)

#### Create Quotation Wizard
*Interactive quotation wizard with customer, industry, site dropdowns, and shutter item selection checkboxes.*
![Create Quotation](./FE/public/screenshots/07-quotations/quotation-create.png)

#### Live Financial Recalculation Summary
*Live financial computation panel showing Shutter Basic Total, GI Top Cover Total, Transportation, GST, and Final Total.*
![Quotation Financial Engine](./FE/public/screenshots/07-quotations/quotation-calculation.png)

---

### 💳 9. Payment Ledger & Balance Tracking (`09-payments/`)

Transaction ledger tracking advance payments, partial settlements, and full payments per quotation with multi-method support (**UPI**, **Cash**, **Cheque**, **Bank Transfer**, **Google Pay**), live balance recalculations, printable receipt vouchers, and WhatsApp receipt dispatching.

#### Features & Capabilities
- **Printable Payment Slip Generator (`PaymentSlipModal`)**: High-fidelity A4 printable receipt voucher featuring company branding, receipt sequence number (`REC-XXXXX`), payment transaction details, transaction date (`DD/MM/YYYY`), amount converted into Indian Rupee words (*e.g., Rupees Ten Thousand Only*), quotation breakdown, remaining balance status badge (*FULLY PAID* / *PARTIALLY PAID*), and signature blocks.
- **One-Click WhatsApp Receipt Sharing**: Generates formatted WhatsApp payment confirmations sent directly to customer mobile numbers.
- **Direct PDF & Print Export**: Integrated `@media print` layout ready for physical printing or PDF saving.

#### Payments List View
*Ledger table displaying payment dates (`DD/MM/YYYY`), quotation numbers, payment methods, transaction reference numbers, received amounts, and action buttons for printing payment slips.*
![Payments List](./FE/public/screenshots/08-payments/payments-list.png)

#### Payment Receipt Slip Voucher Modal
*Official printable payment receipt voucher featuring Swagat Industries letterhead, unique receipt sequence number (`REC-XXXXX`), payment method details, amount converted into Indian Rupee words, quotation summary, remaining balance status badge, and one-click WhatsApp sharing.*
![Payment Receipt Slip](./FE/public/screenshots/08-payments/payment-slip-modal.png)

---

### 🏢 10. Company Settings & Terms (`10-settings/`)

Architecture managing company profile branding, GSTIN/PAN details, bank account info for invoice payments, and configurable PDF terms & conditions.

#### Company Settings & Terms Management
*Centralized company settings dashboard featuring company profile cards, bank details, and quotation terms clauses.*
![Company Settings](./FE/public/screenshots/09-settings/company-settings.png)

---

### 🖨️ 11. Printable PDF Quotation (`11-pdf/`)

High-fidelity PDF preview modal incorporating Swagat Industries letterhead logo, customer details, shutter specification table, itemized financial summary, bank payment instructions, and terms & conditions footer.

#### Printable PDF Quotation Preview
*Clean, enterprise-formatted printable quotation preview featuring official letterhead, customer profile, site specifications, shutter line-item dimension math, tax summary, bank payment instructions, and terms & conditions clauses ready for browser printing or client PDF download.*
![Printable PDF Quotation](./FE/public/screenshots/10-pdf/quotation-pdf-preview.png)

---

## 🧮 Quotation Financial Calculation Engine Math

The calculation engine follows strict mathematical formulas across real-time frontend recalculations, backend controllers, and printable PDF documents:

### 1. Dimension & Conversion Formulas
$$\text{Height (ft)} = \text{ROUND}\left(\frac{\text{Height (inches)}}{12}, 2\right)$$
$$\text{Width (ft)} = \text{ROUND}\left(\frac{\text{Width (inches)}}{12}, 2\right)$$

### 2. Drive Mechanism & Allowance Math
- **Manual Shutter**:
  $$\text{Over Height} = \text{Height (ft)} + 1.50$$
  $$\text{Over Width} = \text{Width (ft)} + 0.50$$
  $$\text{Cover Size (R.Ft)} = \text{Over Width} + 0.50$$
- **Gear / Motorised Shutter**:
  $$\text{Over Height} = \text{Height (ft)} + 2.00$$
  $$\text{Over Width} = \text{Width (ft)} + 0.75$$
  $$\text{Cover Size (R.Ft)} = \text{Over Width} + 0.75$$

### 3. Shutter Item Basic Math
$$\text{Total Sq.Ft} = \text{Over Height} \times \text{Over Width}$$
$$\text{Basic Total (No Cover)} = (\text{Total Sq.Ft} \times \text{Rate/Sqft}) + \text{Gear Price} + \text{Motor Price}$$
$$\text{GI Cover Total} = \text{Cover Size (R.Ft)} \times \text{GI Cover Rate/Sqft}$$
$$\text{Shutter Price (Basic + Cover)} = \text{Basic Total (No Cover)} + \text{GI Cover Total}$$

### 4. Quotation Financial Summary Math
$$\text{Shutter Basic Total} = \sum \text{Shutter Price (Basic + Cover)}$$
$$\text{Total Basic (GST Base)} = \text{Shutter Basic Total} + \text{Transportation Charges} + \text{Additional Charges} - \text{Discount Amount}$$
$$\text{GST Amount} = \text{Total Basic} \times \left(\frac{\text{GST \%}}{100}\right) \quad \text{(if GST Applicable)}$$
$$\text{Final Total (Incl. GST)} = \text{Total Basic} + \text{GST Amount}$$
$$\text{Outstanding Pending Balance} = \text{Final Total} - \sum \text{Recorded Payments}$$

---

## 🛠️ Technology Stack

### Frontend (`/FE`)
- **Framework**: React 18 (`v18.3.1`) + Vite 6 (`v6.0.7`)
- **Styling**: Bootstrap 5 (`v5.3.3`) + Custom CSS Variables & Glassmorphic Animations
- **Icons**: React Icons (`fi` Feather Icons `v5.4.0`)
- **Routing**: React Router DOM (`v6.28.1`)
- **State & Toast**: React Context API (`AuthContext`, `ToastContext`)

### Backend (`/BE`)
- **Runtime**: Node.js (`v18+`) + Express.js (`v4.21.2`)
- **Database**: PostgreSQL (`v14+`)
- **ORM**: Prisma ORM (`v6.4.1`)
- **Security & Auth**: JSON Web Tokens (`jsonwebtoken v9.0.3`) & `bcryptjs` (`v3.0.3`)
- **Email & Mailer System**: Nodemailer (`v6.10.0`) for SMTP OTP delivery and User Invitation codes with HTML branding templates
- **Environment**: Dotenv (`v16.4.7`) & CORS (`v2.8.5`)

---

## 🔌 REST API Endpoints

| Module | Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- | :---: |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user & issue JWT token | ❌ |
| **Auth** | `POST` | `/api/auth/forgot-password` | Request 6-digit password reset OTP email | ❌ |
| **Auth** | `POST` | `/api/auth/verify-otp` | Verify password reset 6-digit OTP code | ❌ |
| **Auth** | `POST` | `/api/auth/reset-password` | Reset account password using verified OTP | ❌ |
| **Auth** | `POST` | `/api/auth/verify-invite` | Verify 6-digit registration invitation code | ❌ |
| **Auth** | `POST` | `/api/auth/complete-invite-registration` | Complete registration with invitation code | ❌ |
| **Auth** | `GET` | `/api/auth/me` | Fetch authenticated user profile | 🟢 |
| **Auth** | `POST` | `/api/auth/logout` | Revoke session & perform logout | 🟢 |
| **Auth** | `POST` | `/api/auth/verify-current-password` | Live verification of current password | 🟢 |
| **Auth** | `POST` | `/api/auth/change-password` | Update current user password | 🟢 |
| **Users** | `GET` | `/api/users` | Fetch all user accounts | 🟢 |
| **Users** | `POST` | `/api/users` | Create new user account directly | 🟢 |
| **Users** | `PUT / DELETE` | `/api/users/:id` | Update or remove user account | 🟢 |
| **Users** | `POST` | `/api/users/invite` | Send email invite code to new team member | 🟢 |
| **Users** | `GET` | `/api/users/invitations` | List pending email invitations | 🟢 |
| **Users** | `DELETE` | `/api/users/invitations/:inviteId` | Revoke pending invitation code | 🟢 |
| **Users** | `POST` | `/api/users/:userId/reset-password` | Admin password reset for user | 🟢 |
| **Dashboard** | `GET` | `/api/dashboard` | Retrieve operational & financial KPI metrics | 🟢 |
| **Customers** | `GET / POST` | `/api/customers` | Fetch or create customer profiles | 🟢 |
| **Customers** | `GET / PUT / DELETE` | `/api/customers/:id` | View, update, or remove customer | 🟢 |
| **Industries** | `GET / POST` | `/api/industries` | Fetch or create corporate accounts | 🟢 |
| **Industries** | `GET / PUT / DELETE` | `/api/industries/:id` | View, update, or remove industry | 🟢 |
| **Sites** | `GET / POST` | `/api/sites` | Fetch or create installation sites | 🟢 |
| **Sites** | `GET / PUT / DELETE` | `/api/sites/:id` | View, update, or remove site | 🟢 |
| **Shutters** | `GET / POST` | `/api/shutters` | Fetch or create shutter specs | 🟢 |
| **Shutters** | `GET / PUT / DELETE` | `/api/shutters/:id` | View, update, or remove shutter spec | 🟢 |
| **Quotations** | `GET / POST` | `/api/quotations` | Fetch or create quotation records | 🟢 |
| **Quotations** | `GET / PUT / DELETE` | `/api/quotations/:id` | View detail, update, or delete quotation | 🟢 |
| **Payments** | `GET / POST` | `/api/payments` | Fetch ledger or record payment | 🟢 |
| **Payments** | `GET` | `/api/payments/:id` | Fetch full payment detail & balance for receipt slip | 🟢 |
| **Payments** | `PUT / DELETE` | `/api/payments/:id` | Update or delete payment transaction | 🟢 |
| **Company Settings** | `GET / PUT` | `/api/company-settings` | Fetch or update company profile & bank details | 🟢 |
| **Quotation Terms** | `GET / POST` | `/api/quotation-terms` | Fetch or create quotation terms clauses | 🟢 |
| **Quotation Terms** | `PUT / DELETE` | `/api/quotation-terms/:id` | Update or delete quotation term clause | 🟢 |
| **Health Check** | `GET` | `/api/health` | Health check & PostgreSQL DB status | ❌ |

---

## 📊 Database Schema Overview

The application utilizes **Prisma ORM** connected to **PostgreSQL** with 12 relational models:

| Model | Table Name | Purpose | Key Relationships |
| :--- | :--- | :--- | :--- |
| `User` | `users` | User accounts & JWT authentication | Has many `UserInvitation` |
| `UserInvitation` | `user_invitations` | Pending 6-digit email invitation codes | Belongs to `User` (invitedBy) |
| `Customer` | `customers` | Primary customer profiles & GSTIN | Has many `Industry`, `Quotation` |
| `Industry` | `industries` | Corporate client entities | Belongs to `Customer`, Has many `Site`, `Quotation` |
| `Site` | `sites` | Physical installation locations | Belongs to `Industry`, Has many `Shutter`, `Quotation` |
| `Shutter` | `shutters` | Master shutter catalog per site | Belongs to `Site`, Has many `QuotationItem` |
| `Quotation` | `quotations` | Quotation header & financial summary | Belongs to `Customer`, `Industry`, `Site`; Has many `QuotationItem`, `AdditionalCharge`, `Payment` |
| `QuotationItem` | `quotation_items` | Snapshot of shutter specs per quotation | Belongs to `Quotation`, `Shutter` |
| `AdditionalCharge` | `additional_charges` | Line items for custom charges | Belongs to `Quotation` |
| `Payment` | `payments` | Transaction ledger for payments | Belongs to `Quotation` |
| `CompanySetting` | `company_settings` | Business profile & banking details | — |
| `QuotationTerm` | `quotation_terms` | Terms & conditions clauses for PDF | — |

---

## 📁 Project Repository Structure

```text
Swagat-Industries-ERP-System/
├── FE/                             # Frontend Application (React 18 + Vite 6)
│   ├── public/                     # Static Assets & Screenshots
│   │   ├── logo.png                # Brand Logo
│   │   └── screenshots/            # Showcase UI Screenshots
│   │       ├── 01-auth/            # Login, Forgot Password & Invite Screenshots
│   │       ├── 02-users/           # User Directory & Invite Modal Screenshots
│   │       ├── 03-dashboard/       # Executive Dashboard Screenshot
│   │       ├── 04-customers/       # Customer CRM Screenshots
│   │       ├── 05-sites/           # Installation Sites Screenshots
│   │       ├── 06-shutters/        # Shutters Catalog Screenshots
│   │       ├── 07-quotations/      # Quotation Engine Screenshots
│   │       ├── 08-payments/        # Payment Ledger & Voucher Screenshots
│   │       └── 10-pdf/             # Printable PDF Preview Screenshots
│   ├── src/
│   │   ├── components/             # Layout (Navbar, Sidebar), Auth, Payment Receipt Slip Modal, UI Modals
│   │   ├── context/                # AuthContext & ToastContext Providers
│   │   ├── pages/                  # Dashboard, Users, Customers, Industries, Sites, Shutters, Quotations, Payments, Settings, Login
│   │   ├── services/               # API Service Layer (`api.js`)
│   │   ├── styles/                 # Theme CSS, Variables & Component Styles
│   │   ├── utils/                  # Input Validation, Date Formatting (DD/MM/YYYY) & Rupee Words Helpers
│   │   ├── App.jsx                 # Routes & Context Providers
│   │   └── main.jsx                # React Entry Point
│   ├── package.json
│   └── vite.config.js
│
├── BE/                             # Backend API Server (Node.js + Express + Prisma)
│   ├── prisma/                     # Database ORM Configuration
│   │   ├── schema.prisma           # PostgreSQL Relational Models (User, UserInvitation, Customer, etc.)
│   │   └── seed.js                 # Admin User & Initial Configuration Seeding
│   ├── src/
│   │   ├── config/                 # Prisma DB Connection Setup (`db.js`)
│   │   ├── controllers/            # Handlers for Auth, Users, Customers, Quotations, Payments, etc.
│   │   ├── middlewares/            # JWT Auth & Error Handling Middleware
│   │   ├── routes/                 # Express API Router Modules
│   │   ├── utils/                  # Financial Math Engine, Mailer (OTP & Invite Emails) & Response Handlers
│   │   ├── app.js                  # Express App Setup & Middleware Configuration
│   │   └── server.js               # Backend Server Entry Point
│   ├── .env                    # Environment Configuration
│   └── package.json
│
├── errors.md                       # Comprehensive Testing & Error Audit Log
└── README.md                       # Main Project Documentation
```

---

## 🚀 Installation & Running Guide

### Prerequisites
- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **PostgreSQL** Database Server (v14.x or higher)

### 1. Database & Backend Setup (`/BE`)

#### Step A: PostgreSQL Installation & Database Creation
1. Install PostgreSQL (v14+) on your system or server.
2. Open PostgreSQL shell (`psql` / pgAdmin) and create a fresh database:
   ```sql
   CREATE DATABASE swagat_erp_db;
   ```

#### Step B: Environment Configuration (`BE/.env`)
Create a `.env` file in the `BE/` directory with the following variables:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/swagat_erp_db?schema=public"
JWT_SECRET="swagat_erp_secret_jwt_key_2026"
JWT_EXPIRES_IN="1d"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@swagatindustries.com"
```

#### Step C: Dependencies, Migrations & Startup
```bash
cd BE
npm install
npm run prisma:migrate
npm run prisma:generate
npm run prisma:seed
npm run dev
```
Backend API will start on `http://localhost:5000`.

---

### 2. Frontend Setup (`/FE`)
```bash
cd FE
npm install
npm run dev
```
Frontend Vite server will start on `http://localhost:5173`.

---

## 💾 Database Backup & Restore Guide

The application includes built-in cross-platform backup and restore utilities that run without requiring PostgreSQL CLI tools in PATH.

### 1. Automated JSON Backup
To export a full database backup snapshot:
```bash
cd BE
npm run db:backup
```
- **Output location**: `backups/swagat_erp_backup_YYYY-MM-DD_HH-mm-ss.json`
- **Pointer update**: `backups/latest_backup.json` is updated automatically.

### 2. Automated JSON Restore
To restore data from the latest backup:
```bash
cd BE
npm run db:restore
```

---

## 💻 Porting ERP to Another Laptop / Machine

To move Swagat ERP to a new machine:

1. **Copy Repository**: Copy the complete project folder (`Swagat-Industries-ERP`) to the new laptop.
2. **Install Software**: Install Node.js (v18+) and PostgreSQL (v14+).
3. **Set Up Database**: Create database `swagat_erp_db` in PostgreSQL.
4. **Configure Environment**: Update `BE/.env` with your local PostgreSQL password.
5. **Run Setup Commands**:
   ```bash
   cd BE
   npm install
   npm run prisma:migrate
   npm run db:restore
   ```
6. **Start Application**: Run `npm run dev` in both `BE` and `FE` folders.

---

## 🧪 Phase 13 E2E Test Results

The system was validated using an automated end-to-end integration test runner (`BE/test_phase13.js`).

| Test Module | Verified Scenarios | Status |
| :--- | :--- | :---: |
| **Auth & User Invites** | Login, Forgot password OTP via Username/Email, Invite code verification | 🟢 PASSED |
| **User Management** | Create user, list users, edit profile, cancel invitation | 🟢 PASSED |
| **Customer CRUD** | Creation, updating, mobile validation, search | 🟢 PASSED |
| **Industry CRUD** | Customer mapping, company registration, contact update | 🟢 PASSED |
| **Site CRUD** | Multi-location mapping under industry, supervisor details | 🟢 PASSED |
| **Shutter Math Engine** | Manual, Gear, Motorised formulas & allowance calculations | 🟢 PASSED |
| **Quotation Engine** | Multi-shutter aggregation, GST Yes/No, company snapshot retention | 🟢 PASSED |
| **Payment Ledger** | Multiple payments, balance recalculations, receipt voucher data | 🟢 PASSED |
| **Backup & Restore** | Clean JSON snapshot dump, database wipe & 100% record restoration | 🟢 PASSED |
| **Dashboard Metrics** | Live PostgreSQL health indicator, financial total counters | 🟢 PASSED |

**Command to re-run test suite**:
```bash
cd BE
node test_phase13.js
```

---

## 📝 License

This software is proprietary and confidential. Developed specifically for **Swagat Industries**.  
All rights reserved.
