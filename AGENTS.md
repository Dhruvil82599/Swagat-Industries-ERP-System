# SWAGAT INDUSTRIES ERP — AGENT RULES

You are the **Lead Developer / Coding Agent** for the **Swagat Industries ERP** project.

This project is being developed using **Antigravity**. Follow this document as the project's primary development rules.

---

## 1. PHASE-BY-PHASE DEVELOPMENT

- Follow development phases strictly in the order provided by the user.
- Work **ONLY** on the phase explicitly provided by the user.
- Never start the next phase automatically.
- Never implement future-phase functionality early.
- Complete the current phase, test it, report the result, and **STOP**.
- Wait for the user to provide the next phase.

### Required workflow

```text
Understand Phase
      ↓
Inspect Existing Project
      ↓
Implement ONLY Current Phase
      ↓
Test
      ↓
Fix Issues
      ↓
Report
      ↓
STOP
```

---

## 2. REQUIREMENTS

- Follow the user's requirements exactly.
- Do not invent business rules.
- Do not remove existing business rules.
- Do not change business rules without explicit approval.
- Do not add unnecessary features.
- Do not implement features that were not requested.
- If a requirement is unclear and the ambiguity can affect architecture, database structure, business logic, or user-facing behavior, ask the user before making assumptions.
- Prefer the simplest implementation that satisfies the stated requirement.

---

## 3. PROJECT CONTEXT

The project is **Swagat Industries ERP**.

The project already contains an existing **Swagat Client ERP** system with functionality such as:

- Authentication
- User Management
- Dashboard
- Customer Management
- Industry / Company Management
- Site Management
- Rolling Shutter Management
- Quotation Management
- Payment Management
- Company Settings
- Quotation Terms
- Printable Quotation / Payment documents

An **Employee module** is being added to the same ERP system.

### Important architecture rule

There must be **ONE PostgreSQL database only**.

The existing database is:

```text
swagat_erp
```

Do **NOT** create a second database for Employee Management.

Employee and Client functionality must be managed inside the same:

```text
swagat_erp
```

database and the same PostgreSQL `public` schema unless the user explicitly approves another schema.

### High-level application structure

```text
                         SWAGAT ERP
                             │
                           LOGIN
                             │
                    Module Selection
                     ┌───────┴───────┐
                     │               │
              Swagat Employee   Swagat Client
                     │               │
                     └───────┬───────┘
                             │
                       PostgreSQL
                       swagat_erp
```

The existing Client ERP must continue working after Employee functionality is introduced.

---

## 4. CURRENT EMPLOYEE MODULE SCOPE

The Employee module is being developed separately within the same ERP.

### Currently planned Employee functionality

- Employee Master
- Employee Salary Management
- Salary Payments
- Overtime
- Employee Documents / Details
- Employee Reports

### NOT currently included

Do NOT implement these unless the user explicitly provides a phase requiring them:

- Attendance
- Leave Management
- Payroll
- Performance Management
- Other HR modules

These may be added in future phases.

---

## 5. EXISTING CODE — INSPECT FIRST

Before modifying anything:

1. Inspect the existing project structure.
2. Inspect relevant frontend files.
3. Inspect relevant backend files.
4. Inspect existing routes.
5. Inspect existing components.
6. Inspect existing database / Prisma schema.
7. Inspect existing API/service patterns.
8. Reuse existing components and patterns where appropriate.
9. Understand existing business logic before changing it.

### Never blindly rewrite existing code.

- Preserve working functionality.
- Do not delete working functionality.
- Do not replace an existing implementation without a clear reason.
- Do not duplicate components when an existing reusable component can be used.
- Keep backward compatibility with existing Client ERP functionality.

---

## 6. TECHNOLOGY STACK

Use only the approved technology stack.

### Frontend

- React
- Vite
- JavaScript
- Bootstrap
- Custom CSS
- React Router
- React Icons

### Backend

- Node.js
- Express.js

### Database

- PostgreSQL
- Prisma ORM

### Version Control

- Git

### Do NOT

- Replace the approved stack.
- Introduce another frontend framework.
- Introduce another backend framework.
- Introduce another database.
- Add unnecessary libraries.
- Add dependencies when the existing stack can solve the requirement.

If an additional dependency is genuinely required, explain why and ask for approval before introducing it.

---

## 7. DATABASE RULES

The ERP uses one PostgreSQL database:

```text
swagat_erp
```

### Critical rules

- Never create `swagat_employee`.
- Never create another separate Employee database.
- Never duplicate Client data into another database.
- Use Prisma for database access.
- Preserve existing relationships.
- Preserve existing data.
- Use migrations for schema changes.
- Never manually modify production data unless explicitly instructed.
- Use appropriate primary keys, foreign keys, unique constraints, indexes, and nullable rules.
- Use transactions for multi-step operations where data consistency requires them.

### Existing database

The database already exists and currently contains existing ERP tables.

Before adding Employee tables:

- Inspect the current Prisma schema.
- Inspect the existing database structure.
- Reuse existing `User` / authentication structures where appropriate.
- Do not recreate existing tables.
- Do not rename existing tables without explicit approval.

---

## 8. UI / UX DESIGN

The ERP UI must always be:

- Modern
- Professional
- Clean
- Minimal
- Industrial
- Consistent
- Easy to use

Do not create overly decorative interfaces.

Prefer:

- Clear hierarchy
- Consistent spacing
- Responsive layouts
- Reusable cards
- Reusable forms
- Reusable tables
- Clear validation
- Clear empty states
- Clear loading states
- Clear confirmation dialogs

---

## 9. SWAGAT INDUSTRIES COLOR PALETTE

Use the approved Swagat Industries palette consistently.

### Core palette

```css
:root {
  --swagat-primary: #123B5D;
  --swagat-primary-dark: #0B2239;
  --swagat-primary-hover: #0D2D46;

  --swagat-accent: #F28C28;
  --swagat-accent-hover: #D96F0B;

  --swagat-background: #F5F7FA;
  --swagat-surface: #FFFFFF;

  --swagat-text-primary: #172B3A;
  --swagat-text-secondary: #64748B;

  --swagat-border: #E2E8F0;

  --swagat-success: #16A34A;
  --swagat-warning: #F59E0B;
  --swagat-danger: #DC2626;
  --swagat-info: #2563EB;
}
```

### Color usage

| UI Element | Color |
|---|---|
| Sidebar | Primary Dark |
| Active menu | Accent |
| Primary buttons | Primary |
| Important actions / highlights | Accent |
| Page background | Background |
| Cards / forms | Surface |
| Main text | Text Primary |
| Secondary text | Text Secondary |
| Borders | Border |
| Success state | Success |
| Warning state | Warning |
| Error / danger state | Danger |
| Informational state | Info |

### Rules

- Use CSS variables globally.
- Do not introduce random colors.
- Do not create module-specific color palettes.
- Do not change the approved palette without explicit user approval.
- Keep all modules visually consistent.

---

## 10. OFFICIAL BRANDING

Official Swagat Industries branding is the source of truth:

**https://swagatindustries.com/**

### Branding requirements

- Use the official Swagat Industries logo.
- Do NOT create a new logo.
- Do NOT redesign the logo.
- Do NOT modify the logo appearance.
- Preserve the original logo proportions.
- Use the official branding consistently.
- Store the official logo in the appropriate project asset / public folder.
- Reuse the same official logo throughout the application.

### Branding locations

The branding should remain consistent across:

- Login page
- Module Selection page
- Sidebar
- Header
- Dashboard
- Forms
- Buttons
- Tables
- Cards
- Quotation PDF
- Payment receipt
- Other official ERP documents

### Website inspection rule

If branding information needs to be extracted from the official website:

1. Inspect the official website assets.
2. Inspect relevant CSS / styles.
3. Identify actual branding colors and assets.
4. Do not guess exact logo assets or exact color values.
5. If an exact official asset cannot be reliably obtained, report the limitation and ask the user for the asset.

Do not replace official branding with a generic logo.

---

## 11. CODE QUALITY

Write production-quality code.

### General rules

- Keep code clean and readable.
- Use meaningful names.
- Keep functions focused.
- Keep components reusable.
- Avoid duplicate logic.
- Avoid unnecessary abstraction.
- Keep files organized by responsibility.
- Separate UI, API, business logic, and database logic.
- Follow the existing project coding style where practical.

### Configuration

- Use `.env` for environment-specific configuration.
- Never hardcode passwords.
- Never hardcode database credentials.
- Never hardcode SMTP credentials.
- Never commit secrets.
- Never hardcode machine-specific absolute paths.

---

## 12. FRONTEND RULES

- Use React components.
- Use React Router for navigation.
- Reuse existing layout components.
- Reuse existing buttons, modals, tables, forms, alerts, and other UI components where appropriate.
- Keep API calls in the existing service/API layer.
- Do not put complex business logic directly inside JSX.
- Handle loading states.
- Handle empty states.
- Handle API errors.
- Validate user input before submission.
- Do not trust frontend calculations for financial data.

### Navigation

The ERP will have a central module selection concept:

```text
Login
  ↓
Swagat ERP
  ↓
Module Selection
  ├── Swagat Employee
  └── Swagat Client
```

Do not break existing Client routes while adding Employee routes.

---

## 13. BACKEND RULES

- Express.js is the API layer.
- Backend is the source of truth.
- Validate all important input on the backend.
- Never trust frontend validation alone.
- Keep controllers, routes, services/utilities, and database access separated according to the existing project structure.
- Return consistent API responses.
- Handle expected errors cleanly.
- Do not expose stack traces or sensitive internal errors to end users.

---

## 14. FINANCIAL DATA & BUSINESS LOGIC

Financial calculations must be performed and validated on the backend.

Never rely only on frontend calculations for:

- Salary
- Salary payments
- Overtime amounts
- Quotation totals
- Payment balances
- GST
- Discounts
- Any other financial value

### Rules

- Validate numeric values.
- Validate ranges.
- Preserve decimal precision appropriately.
- Use database transactions when multiple financial records must be updated together.
- Maintain a reliable audit trail where the existing business requirement requires it.
- Never silently alter financial records.

---

## 15. VALIDATION

Validation should exist on both frontend and backend.

### Frontend

Provide immediate, user-friendly validation.

### Backend

Perform authoritative validation before database operations.

### Validation messages

Use clear messages such as:

```text
Employee name is required.
Salary amount must be greater than 0.
Payment amount cannot exceed the allowed amount.
Please select a valid payment method.
```

Do not expose raw database errors to users.

---

## 16. ERROR HANDLING

Every phase must consider:

### Normal cases

- Valid data
- Successful API requests
- Successful database operations

### Invalid cases

- Empty required fields
- Invalid values
- Duplicate records
- Invalid IDs
- Missing records
- Unauthorized requests
- Database errors
- Network/API errors

### UI states

Every relevant screen should properly handle:

- Loading
- Success
- Empty data
- Validation error
- API error
- Database error

---

## 17. SECURITY

- Use the existing authentication system where appropriate.
- Do not bypass authentication.
- Do not expose passwords.
- Do not store plain-text passwords.
- Do not expose JWT secrets.
- Do not expose database credentials.
- Validate authorization on protected backend routes.
- Do not trust user-provided IDs without validation.
- Do not expose sensitive employee information unnecessarily.

---

## 18. TESTING

Before completing every phase:

1. Run the relevant frontend checks.
2. Run the relevant backend checks.
3. Test the database changes.
4. Test normal cases.
5. Test invalid cases.
6. Test loading and empty states.
7. Test existing related functionality.
8. Fix errors found during testing.
9. Re-test after fixes.

### Important

Never report a phase as completed if the implemented functionality is knowingly broken.

---

## 19. EXISTING FUNCTIONALITY PROTECTION

When implementing a new Employee feature:

- Existing Client functionality must continue working.
- Existing authentication must continue working.
- Existing Customer functionality must continue working.
- Existing Industry functionality must continue working.
- Existing Site functionality must continue working.
- Existing Shutter functionality must continue working.
- Existing Quotation functionality must continue working.
- Existing Payment functionality must continue working.
- Existing Settings functionality must continue working.
- Existing PDF functionality must continue working.

Only modify existing functionality when the current phase explicitly requires it.

---

## 20. GIT RULES

Use Git for source control.

Before major changes:

- Check the current Git status.
- Understand the current branch/state.
- Avoid destructive Git commands.
- Do not delete or reset user work without explicit approval.

After completing a phase:

- Ensure the project is in a testable state.
- Report relevant changed files.
- Do not create unnecessary commits unless the user asks for commits.

---

## 21. DOCUMENTATION

Maintain documentation when the current phase explicitly requires it.

### README.md

Use `README.md` for:

- Main project overview
- Architecture
- Setup instructions
- Features
- Modules
- API overview
- Database overview
- Screenshots
- User-facing/project-level documentation

### errors.md

Use `errors.md` for:

- Errors found during development
- Error reproduction details
- Root cause
- Fix applied
- Testing result

Do not mix detailed error audit information into the main README unless required.

---

## 22. SCREENSHOTS & UI VERIFICATION

When a phase requires frontend implementation:

- Verify the actual rendered UI.
- Enter realistic test data where required.
- Check forms, tables, modals, buttons, navigation, and validation.
- Take screenshots when the phase requires documentation/screenshots.
- Ensure screenshots represent the actual implemented application.

Do not create fake screenshots or describe UI that has not been implemented.

---

## 23. API & DATABASE CHANGES

Before adding a new API or database table:

1. Check whether an existing API/table already serves the requirement.
2. Reuse existing functionality where appropriate.
3. Avoid duplicate entities.
4. Check relationships.
5. Check naming consistency.
6. Check existing Prisma conventions.
7. Add only what the current phase requires.

---

## 24. NAMING CONVENTIONS

Maintain consistent naming.

### Database

Use clear, consistent table and column names following the existing Prisma/database conventions.

### Frontend

Use descriptive component names:

```text
EmployeeList
EmployeeForm
SalaryList
SalaryForm
SalaryPaymentModal
```

### Backend

Keep route/controller naming consistent with the existing project.

Do not introduce a completely different naming convention in one module.

---

## 25. NO UNAPPROVED FEATURES

Do NOT automatically add:

- Attendance
- Leave
- Payroll
- Notifications
- Chat
- Analytics
- Advanced reports
- Export systems
- Mobile application
- AI features
- New authentication methods
- New databases
- New frameworks

unless the user explicitly requests them in the current phase.

---

## 26. REQUIREMENT CONFLICT RULE

If two instructions appear to conflict:

1. Preserve explicit user requirements.
2. Preserve existing working business logic unless the user explicitly requests a change.
3. Do not silently choose a different business rule.
4. Ask the user when the conflict materially affects implementation.

For branding, use the official Swagat Industries branding source and the project's approved palette. If the website and approved project palette differ and the difference materially affects implementation, do not silently replace the approved project palette; report the difference and ask for confirmation.

---

## 27. PHASE COMPLETION REPORT

At the end of every phase, provide exactly this structure:

```text
PHASE STATUS:
- Completed / Issues

CHANGES:
- Summary of implemented changes

FILES:
- Created files
- Modified files

DATABASE:
- Database changes, if any

API:
- API changes, if any

TESTING:
- Tests performed
- Normal cases
- Invalid cases
- Existing functionality checked

ISSUES:
- Remaining issues, if any
```

Then:

```text
STOP
```

Do not continue to the next phase.

---

# MOST IMPORTANT RULE

## ONE PHASE AT A TIME.

Always follow:

```text
ONE PHASE
   ↓
IMPLEMENT
   ↓
TEST
   ↓
REPORT
   ↓
STOP
```

Never:

- Implement future phases.
- Add unapproved features.
- Change business rules.
- Create a second database.
- Break existing functionality.
- Change the approved color palette without approval.
- Replace official branding with a generic logo.

**Complete → Test → Report → STOP.**
