# 🏭 Swagat Industries ERP & Quotation Management System

A modern, full-stack Enterprise Resource Planning (ERP) and Quotation Management System tailored for **Swagat Industries**, specializing in Rolling Shutter Manufacturing, Installation, and Financial Management.

---

## 📸 Application Showcase & Screenshots

### 🔐 Login & Authentication
*Secure, animated login interface with Swagat Industries branding and JWT token authentication.*
![Login Screen](./FE/public/screenshots/login.png)

<br/>

### 👥 Customer Management
*Centralized customer relationship management with contact numbers, addresses, and GST profiles.*
![Customer Management](./FE/public/screenshots/customers.png)

<br/>

### 🏢 Industry & Company Management
*Link multiple industrial units and corporate clients directly under each customer.*
![Industry Management](./FE/public/screenshots/industries.png)

<br/>

### 📍 Installation Sites & Locations
*Track multi-location installation sites, city details, and site contact persons.*
![Sites Management](./FE/public/screenshots/sites.png)

<br/>

### 🚪 Shutters Master Catalog
*Configure shutter specs, height & width dimensions, fitting types (A/B), and drive mechanisms (Manual, Gear, Motorised).*
![Shutters Master](./FE/public/screenshots/shutters.png)

<br/>

### 📜 Quotation Management & Financial Engine
*Automated quotation generator with line-item sq.ft math, GI top covers, transportation fees, GST calculations, and payments tracking.*
![Quotations Engine](./FE/public/screenshots/quotations.png)

---

## 🌟 Key Features

- 🔐 **Authentication & Security**: Protected JWT backend endpoints and role-based frontend routing.
- 👥 **Customer Management**: Maintain customer contact details, addresses, and GST profiles.
- 🏢 **Industry & Site Hierarchy**: Link multiple industrial units and installation sites to each customer.
- 🚪 **Shutter Master Catalog**: Track custom shutter specifications, dimensions (Height, Width, Sq.Ft conversions), fitting types (A-Type, B-Type), and drive types (Manual, Gear, Motorised).
- 📜 **Quotations Engine**: Automated quotation generation with precise financial formulas:
  - Shutter basic calculations & GI top cover rates.
  - Custom transportation & additional item charges.
  - Flexible discount application & GST calculations.
- 💳 **Payment Tracking**: Record advance payments, installments, UPI/Cheque/Bank transactions per quotation.
- 🖨️ **Professional Documents**: Generate styled quotation PDFs ready for customer sharing.

---

## 🛠️ Tech Stack

### Frontend (`/FE`)
- **Framework**: React 18 + Vite
- **Styling**: Bootstrap 5 + Modern Custom CSS Tokens
- **Icons**: React Icons
- **Routing**: React Router v6

### Backend (`/BE`)
- **Runtime**: Node.js + Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma ORM v6
- **Auth & Security**: JWT & Bcryptjs

---

## 📁 Repository Structure

```text
Swagat-Industries-ERP-System/
├── FE/                     # Frontend Application (React + Vite)
│   ├── public/             # Static Assets, Logos & Screenshots
│   │   └── screenshots/    # Application Screenshots for Documentation
│   ├── src/
│   │   ├── components/     # UI Components, Layout, Navbar, Sidebar
│   │   ├── context/        # React Context Providers (Toast, Auth)
│   │   ├── pages/          # Customers, Industries, Sites, Shutters, Quotations, Login
│   │   ├── services/       # Axios / Fetch API Service Layer
│   │   └── styles/         # Modern Theme CSS & Styling System
│   ├── package.json
│   └── vite.config.js
│
├── BE/                     # Backend API Server (Node.js + Express + Prisma)
│   ├── prisma/             # Prisma Schema, Migrations & Seeds
│   │   ├── schema.prisma   # PostgreSQL Models
│   │   └── seed.js         # Initial Admin Seeding Script
│   ├── src/                # Express Controllers, Routes, Middlewares
│   ├── .env.example        # Environment Variables Template
│   └── package.json
│
└── README.md               # Project Documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **PostgreSQL** database server

---

### 1. Backend Setup (`/BE`)

1. Navigate to the backend directory:
   ```bash
   cd BE
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` and configure your database credentials:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://username:password@localhost:5432/swagat_erp?schema=public"
   JWT_SECRET="your_secret_key"
   ADMIN_USERNAME="admin"
   ADMIN_PASSWORD="adminpassword123"
   ```

4. Run database migrations & seed initial admin user:
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   npm run prisma:seed
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will run on `http://localhost:5000`.

---

### 2. Frontend Setup (`/FE`)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd FE
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend app will run on `http://localhost:3000` (or `http://localhost:5173`).

---

## 📊 Database Schema Overview

The database uses Prisma ORM connected to PostgreSQL with the following core entities:

- `User`: Administrator accounts & password hashes (`bcryptjs`).
- `Customer`: Primary customer records & GST details.
- `Industry`: Industrial client companies associated with customers.
- `Site`: Specific physical installation sites belonging to an industry.
- `Shutter`: Master catalog of shutter specs and default pricing per site.
- `Quotation`: Quotation header with total financials, GST, discounts, and site reference.
- `QuotationItem`: Snapshot of individual shutters snapshot within a quotation.
- `AdditionalCharge`: Line items for custom charges (freight, labor, fittings).
- `Payment`: Transaction ledger for payments received against quotations.
- `CompanySetting`: Swagat Industries business profile & bank details.
- `QuotationTerm`: Standard terms and conditions for printed documents.

---

## 💡 Useful Commands

### Backend (`BE/`)
- `npm run dev` — Start Node backend in watch mode
- `npm run prisma:seed` — Seed or update initial admin user
- `npm run prisma:studio` — Open Prisma Studio GUI for database inspection
- `npm run prisma:migrate` — Apply database schema migrations

### Frontend (`FE/`)
- `npm run dev` — Start Vite development server
- `npm run build` — Build production distribution bundle
- `npm run preview` — Preview production build locally

---

## 📝 License

This project is proprietary software developed for **Swagat Industries**.
All rights reserved.
