# 🏭 Swagat Industries ERP & Quotation Management System

A modern, full-stack Enterprise Resource Planning (ERP) and Quotation Management System tailored specifically for **Swagat Industries**, specializing in Rolling Shutter Manufacturing, Installation, Financial Management, and Payment Tracking.

---

## 📸 Application Showcase & Screenshots

### 🔐 Login & Authentication
*Secure login interface featuring Swagat Industries branding, JWT token authentication, bcrypt password hashing, and protected route navigation wrappers.*
![Login Screen](./FE/public/screenshots/login.png)

<br/>

### 📊 Executive Dashboard & Financial Overview
*Centralized executive dashboard showcasing 5 operational entity counters, a dedicated Payment & Financial Summary section with 3 distinct color-accented KPI cards, interactive hover micro-animations, live database health monitoring, and recent quotation streams.*
![Executive Dashboard](./FE/public/screenshots/dashboard.png)

<br/>

### 👥 Customer Management & Real-Time Format Validation
*Centralized customer relationship management with real-time Indian GSTIN (15-character uppercase regex) and 10-digit mobile number keyup validation badges.*
![Customer Management](./FE/public/screenshots/customers.png)

<br/>

### 🏢 Industry & Corporate Client Directory
*Multi-level corporate client management linking multiple industrial units and subsidiary accounts directly under parent customer records.*
![Industry Directory](./FE/public/screenshots/industries.png)

<br/>

### 📍 Installation Sites & Locations
*Multi-location site tracking with city locations, site supervisors, contact phone numbers, installation remarks, and linked shutter counts.*
![Installation Sites](./FE/public/screenshots/sites.png)

<br/>

### 🚪 Rolling Shutters Master Catalog
*Technical shutter catalog supporting custom height & width inputs in inches with automatic Sq.Ft calculations, fitting types (A-Type Guide Inside / B-Type Guide Outside), and drive mechanisms (Manual, Gear, Motorised).*
![Shutters Master Catalog](./FE/public/screenshots/shutters.png)

<br/>

### 📜 Quotations & Financial Recalculation Engine
*Automated quotation generator featuring a 14-column detailed breakdown table with 3 explicit financial total columns, formula calculation sequence banners, additional charges, transportation fees, configurable GST rates (0% to 28%), and discount management.*
![Quotations Engine](./FE/public/screenshots/quotations.png)

---

## 🌟 Key Features

- 🔐 **JWT Authentication & Security**:
  - Protected backend API routes enforced via JWT verification middleware (`jsonwebtoken`).
  - Account security features with hashed passwords (`bcryptjs`), user details API, and modal password change.
  - Client-side navigation control with `ProtectedRoute` wrappers and session persistence in LocalStorage.
  - Public `/api/health` monitoring endpoint displaying real-time PostgreSQL database connectivity status.

- 📊 **Executive Dashboard & Financial Summary**:
  - **Master Data Operational Row**: 5 metric cards tracking total active Customers, Industrial Accounts, Installation Sites, Shutter Specs, and Total Quotations.
  - **Payment & Financial Summary Section**: 3 visually segregated financial cards featuring:
    - **Total Billed Amount** (`#059669` emerald border): Gross revenue across all finalized quotations.
    - **Total Received Payments** (`#16A34A` success green border): Settled payment collections with status badge.
    - **Outstanding Pending Balance** (`#DC2626` danger red border): Remaining receivable balance across active accounts.
  - **Dynamic Micro-Interactions**: Smooth card elevation (`translateY(-4px)`), depth drop-shadows, and 1.1x icon scaling on hover.

- 👥 **Client & Multi-Site Hierarchy**:
  - **Customer Level**: Primary client profiles storing contact details, addresses, and GSTIN profiles.
  - **Industry Level**: Corporate company units linked to parent customer entities.
  - **Site Level**: Physical installation locations linked to industries with city locations and site supervisors.
  - **Shutter Level**: Technical shutter specifications mapped per installation site.

- 🚪 **Shutter Technical Specifications & Catalog**:
  - Imperial dimension inputs (Height & Width in inches) automatically converted to Feet and Sq.Ft area.
  - Support for 3 Drive Mechanisms: **Manual**, **Gear**, and **Motorised**.
  - Support for 2 Fitting Types: **A-Type** (Guide Inside) and **B-Type** (Guide Outside).
  - Configurable pricing attributes: Shutter Rate per Sq.Ft, GI Top Cover Rate per Sq.Ft, Gear prices, Motor prices, and per-item GST applicability flags.

- 📜 **Quotation Calculation & Recalculation Engine**:
  - Independent line-item snapshots preserving historical shutter specs per quotation.
  - **14-Column Financial Table Breakdown**: Explicitly displays `Basic Total (No Cover)`, `GI Cover Total`, and `Shutter Price (Basic + Cover)`.
  - **Step-by-Step Financial Sequence**:
    1. Item Shutter Price calculation (`(Over H × Over W × Rate/Sqft) + Drive Price + GI Cover`).
    2. Additional Charges (Clean Description & Amount inputs) & Transportation Fees.
    3. Configurable GST percentages (0%, 5%, 12%, 18%, 28%) and automatic tax computation.
    4. Flexible discount application with rationale notes.
  - Full structural and visual parity across Wizard Item Editor, View Quotation Modal, and Printable PDF Preview.

- 💳 **Payment Ledger & Balance Tracking**:
  - Record advance payments, installments, and partial settlements per quotation.
  - Multi-method support: **UPI**, **Cash**, **Cheque**, **Bank Transfer**, **Google Pay**.
  - Detailed metadata logging: Transaction reference numbers, cheque numbers, cheque dates, and bank names.
  - Real-time automatic balance recalculation (Total Paid vs Outstanding Balance) with visual payment status badges (**Paid**, **Partial**, **Unpaid**).

- 🏢 **Company Settings & Quotation Terms**:
  - **3-Card Architecture**:
    - **Card 1: Company Profile**: Company Name, Logo URL, Mobile, Alt Mobile, Email, Website, GSTIN, PAN, Address, City/State/Pincode.
    - **Card 2: Bank Account Details**: Bank Name, Account Number, IFSC Code, Branch Name for invoice payments.
    - **Card 3: Configurable Terms & Conditions**: Interactive term management with order sorting (#), term title, clause text, active/inactive toggles, and CRUD actions.
  - Automatic application of active company profile and terms to newly created quotation PDFs while preserving historical PDF integrity.

- 🖨️ **Printable PDF Quotation Generator**:
  - High-fidelity PDF preview modal (`QuotationPDFModal`) with browser printing capabilities.
  - Formatted layout incorporating Swagat Industries letterhead logo, client info, shutter technical tables, itemized financial summaries, bank payment details, and terms & conditions footer.

- 🛠️ **Data Validation & Integrity**:
  - **GSTIN Format Validation**: Enforces standard 15-character Indian GSTIN format (`/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/`) forced to UPPERCASE with dynamic green (`✓`) and red (`✕`) key-release feedback counters.
  - **Mobile Number Validation**: Enforces 10-digit mobile number format with real-time length feedback (`X/10`).

---

## 🧮 Quotation Financial Calculation Engine

The shutter and quotation engine follows strict mathematical formulas across real-time frontend recalculations, backend controllers, and printable PDF documents:

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

## 🛠️ Tech Stack

### Frontend (`/FE`)
- **Framework**: React 18 (`v18.3.1`) + Vite 6 (`v6.0.7`)
- **Styling**: Bootstrap 5 (`v5.3.3`) + Custom CSS Design Tokens
- **Icons**: React Icons (`fi` Feather Icons `v5.4.0`)
- **Routing**: React Router DOM (`v6.28.1`)
- **State & Toast**: React Context API (`AuthContext`, `ToastContext`)

### Backend (`/BE`)
- **Runtime**: Node.js (`v18+`) + Express.js (`v4.21.2`)
- **Database**: PostgreSQL (`v14+`)
- **ORM**: Prisma ORM (`v6.4.1`)
- **Security & Auth**: JSON Web Tokens (`jsonwebtoken v9.0.3`) & `bcryptjs` (`v3.0.3`)
- **Environment**: Dotenv (`v16.4.7`) & CORS (`v2.8.5`)

---

## 🔌 API Endpoints Summary

| Module | Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- | :---: |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user & generate JWT token | ❌ |
| **Auth** | `GET` | `/api/auth/me` | Fetch currently authenticated user profile | 🟢 |
| **Auth** | `PUT` | `/api/auth/change-password` | Update current user account password | 🟢 |
| **Dashboard** | `GET` | `/api/dashboard/stats` | Retrieve operational & financial KPI metrics | 🟢 |
| **Customers** | `GET` | `/api/customers` | Fetch all customer records | 🟢 |
| **Customers** | `POST` | `/api/customers` | Create new customer profile | 🟢 |
| **Customers** | `GET / PUT / DELETE` | `/api/customers/:id` | View, update, or remove customer | 🟢 |
| **Industries** | `GET` | `/api/industries` | Fetch industrial corporate accounts | 🟢 |
| **Industries** | `POST` | `/api/industries` | Create new industrial corporate entity | 🟢 |
| **Industries** | `GET / PUT / DELETE` | `/api/industries/:id` | View, update, or remove industry | 🟢 |
| **Sites** | `GET` | `/api/sites` | Fetch installation site locations | 🟢 |
| **Sites** | `POST` | `/api/sites` | Create new installation site | 🟢 |
| **Sites** | `GET / PUT / DELETE` | `/api/sites/:id` | View, update, or remove site | 🟢 |
| **Shutters** | `GET` | `/api/shutters` | Fetch shutter specs catalog | 🟢 |
| **Shutters** | `POST` | `/api/shutters` | Create new shutter specification | 🟢 |
| **Shutters** | `GET / PUT / DELETE` | `/api/shutters/:id` | View, update, or remove shutter spec | 🟢 |
| **Quotations** | `GET` | `/api/quotations` | Fetch quotations list | 🟢 |
| **Quotations** | `POST` | `/api/quotations` | Create new quotation record | 🟢 |
| **Quotations** | `GET / PUT / DELETE` | `/api/quotations/:id` | View detail, update, or delete quotation | 🟢 |
| **Payments** | `GET` | `/api/payments` | Fetch payment transactions ledger | 🟢 |
| **Payments** | `POST` | `/api/payments` | Record payment against quotation | 🟢 |
| **Payments** | `DELETE` | `/api/payments/:id` | Delete payment entry & recalculate balance | 🟢 |
| **Company Settings** | `GET` | `/api/company-settings` | Fetch company profile & banking details | 🟢 |
| **Company Settings** | `PUT` | `/api/company-settings` | Update company profile & banking details | 🟢 |
| **Quotation Terms** | `GET / POST` | `/api/quotation-terms` | Fetch or create quotation terms | 🟢 |
| **Quotation Terms** | `PUT / DELETE` | `/api/quotation-terms/:id` | Update or delete quotation term clause | 🟢 |
| **Health Check** | `GET` | `/api/health` | Health check & PostgreSQL DB status | ❌ |

---

## 📊 Database Schema Overview

The application utilizes **Prisma ORM** connected to **PostgreSQL** with 11 relational models:

| Model | Table Name | Purpose | Key Relationships |
| :--- | :--- | :--- | :--- |
| `User` | `users` | Administrator accounts & JWT auth | — |
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

## 📁 Repository Structure

```text
Swagat-Industries-ERP-System/
├── FE/                             # Frontend Application (React 18 + Vite 6)
│   ├── public/                     # Static Assets, Logos & Documentation Screenshots
│   │   ├── logo.png                # Swagat Industries Brand Logo
│   │   └── screenshots/            # Showcase UI Screenshots
│   │       ├── login.png           # Login Screen
│   │       ├── dashboard.png       # Executive Dashboard
│   │       ├── customers.png       # Customer Management
│   │       ├── industries.png      # Corporate Industry Directory
│   │       ├── sites.png           # Installation Sites
│   │       ├── shutters.png        # Rolling Shutters Master Catalog
│   │       └── quotations.png      # Quotation Calculation Engine
│   ├── src/
│   │   ├── components/             # Reusable Layout & Modal Components
│   │   │   ├── Auth/               # ProtectedRoute Wrapper
│   │   │   ├── Layout/             # Navbar, Sidebar, AppLayout
│   │   │   └── UI/                 # Toast, ConfirmModal, QuotationPDFModal, QuotationTermsModal
│   │   ├── context/                # AuthContext & ToastContext Providers
│   │   ├── pages/                  # Dashboard, Customers, Industries, Sites, Shutters, Quotations, Payments, CompanySettings, Login
│   │   ├── services/               # Axios/Fetch API Layer (`api.js`, `authAPI.js`)
│   │   ├── styles/                 # Theme CSS, Variables & Component Styles
│   │   ├── utils/                  # Input Validation & Format Helpers
│   │   ├── App.jsx                 # Client Application Routes & Providers
│   │   └── main.jsx                # React Entry Point
│   ├── package.json
│   └── vite.config.js
│
├── BE/                             # Backend API Server (Node.js + Express + Prisma)
│   ├── prisma/                     # Database ORM Configuration
│   │   ├── schema.prisma           # PostgreSQL Prisma Relational Models
│   │   └── seed.js                 # Database Seeding Script (Admin User & Configuration)
│   ├── src/
│   │   ├── config/                 # Prisma DB Connection Setup (`db.js`)
│   │   ├── controllers/            # Controller Handlers for all 11 ERP Modules
│   │   ├── middlewares/            # JWT Authentication Middleware (`authMiddleware.js`)
│   │   ├── routes/                 # Express Router Modules
│   │   ├── utils/                  # Financial Math Calculations & Response Wrappers
│   │   ├── app.js                  # Express Application Setup & CORS Configuration
│   │   └── server.js               # Backend Server Entry Point
│   ├── .env.example                # Environment Variables Template
│   └── package.json
│
├── backups/                        # Safety Database Export Backups
│   └── before-dummy-data-cleanup.json
├── README.md                       # Comprehensive Project Documentation
├── phase-10.md                     # Executive Dashboard & Validation Requirements
├── phase-11.md                     # Company Settings Architecture
├── phase-12.md                     # Database Backup & Migration Guide
└── phase-13.md                     # Final UI Polish & Business Verification Checklist
```

---

## 🚀 Getting Started

### Prerequisites

Ensure the following tools are installed on your workstation:
- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **PostgreSQL** Database Server (v14.x or higher)

---

### 1. Backend Setup (`/BE`)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd BE
   ```

2. Install backend Node.js dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file inside the `BE/` directory based on `.env.example`:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/swagat_erp?schema=public"
   JWT_SECRET="swagat_erp_super_secret_jwt_key_2026"
   ADMIN_USERNAME="admin"
   ADMIN_PASSWORD="adminpassword123"
   ```

4. Run PostgreSQL Schema Migrations & Generate Prisma Client:
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```

5. Seed Initial Admin User & Configuration:
   ```bash
   npm run prisma:seed
   ```

6. Start the Backend Development Server:
   ```bash
   npm run dev
   ```
   The API server will start on `http://localhost:5000` with live reloading.

---

### 2. Frontend Setup (`/FE`)

1. Open a new terminal tab and navigate to the frontend directory:
   ```bash
   cd FE
   ```

2. Install frontend React dependencies:
   ```bash
   npm install
   ```

3. Start the Vite Development Server:
   ```bash
   npm run dev
   ```
   The application will run locally on `http://localhost:3000` (or `http://localhost:5173`).

---

## 💾 Database Backup & Restore Guide

### 1. Creating a Database Backup
To create a complete SQL backup of the PostgreSQL database:
```bash
pg_dump -U postgres -d swagat_erp -F c -b -v -f "backups/swagat_erp_backup_$(date +%Y%m%d).dump"
```

### 2. Restoring Database from Backup
To restore a saved PostgreSQL backup dump:
```bash
# 1. Drop existing database if restoring fresh
dropdb -U postgres swagat_erp

# 2. Create fresh database
createdb -U postgres swagat_erp

# 3. Restore dump file
pg_restore -U postgres -d swagat_erp -v "backups/swagat_erp_backup_YYYYMMDD.dump"
```

---

## 💡 Useful Commands

### Backend (`BE/`)
- `npm run dev` — Launch backend server with live reload (`node --watch src/server.js`)
- `npm run start` — Run backend in production mode
- `npm run prisma:migrate` — Run Prisma schema migrations (`prisma migrate dev`)
- `npm run prisma:generate` — Generate Prisma Client code
- `npm run prisma:seed` — Seed initial database records (`admin` account)
- `npm run prisma:studio` — Open Prisma Studio GUI to inspect PostgreSQL tables

### Frontend (`FE/`)
- `npm run dev` — Start Vite frontend dev server (`http://localhost:3000`)
- `npm run build` — Build optimized production bundle
- `npm run preview` — Locally preview production build

---

## 📝 License

This software is proprietary and confidential. Developed specifically for **Swagat Industries**.  
All rights reserved.
