<!-- This Prompt takes rull entyre project , take screenshots from actual running app , take only real screenshots no fake one and update that screenshots in README.md with their discription . in details. -->

MASTER PROMPT
SWAGAT INDUSTRIES ERP
COMPLETE PROJECT INSPECTION + FULL FRONTEND TESTING + REAL DATA ENTRY + SCREENSHOTS + README DOCUMENTATION

============================================================
MAIN OBJECTIVE
============================================================

I have an existing Swagat Industries ERP project.

Your task is to completely inspect, understand, run, test and document
the CURRENT application from scratch.

This task is NOT for developing new features.

This task is for:

1. Complete project inspection
2. Complete file/folder inspection
3. Complete frontend inspection
4. Complete backend inspection
5. Complete database/Prisma inspection
6. Complete API inspection
7. Complete authentication inspection
8. Run the actual application
9. Test the application through a real browser
10. Enter all test/dummy data ONLY through the frontend UI
11. Check EVERY input field
12. Test validations and dynamic fields
13. Test the complete application flow
14. Capture REAL screenshots from the running application
15. Add screenshots to README.md
16. Add professional descriptions for screenshots
17. Create errors.md ONLY if errors/issues are found
18. Keep detailed error information ONLY inside errors.md
19. Verify README.md and screenshot paths
20. Provide a final testing report

============================================================
CRITICAL RULE — CURRENT PROJECT IS SOURCE OF TRUTH
============================================================

The CURRENT codebase is the ONLY source of truth.

Do NOT blindly use:

- Old README
- Old documentation
- Old screenshots
- Old project structure
- Old assumptions
- Previous implementation details

First inspect the actual current project.

Only document features, modules, APIs, database models and behavior
that actually exist in the CURRENT project.

Do NOT invent anything.

============================================================
CRITICAL RULE — DO NOT MODIFY APPLICATION
============================================================

During this task, DO NOT modify:

- React code
- Frontend functionality
- Backend code
- Express code
- API behavior
- Prisma schema
- Database structure
- Business logic
- Calculation logic
- Authentication
- Existing UI
- Existing features

Do NOT:

- Add new features
- Remove features
- Redesign UI
- Add dependencies
- Remove dependencies
- Change calculations
- Change database schema
- Change API contracts

This is an AUDIT + TESTING + DOCUMENTATION task.

If a bug is found:

DOCUMENT IT.

Do NOT silently fix it.

============================================================
PHASE 1 — COMPLETE PROJECT STRUCTURE INSPECTION
============================================================

Start from the project root.

First identify the actual project root.

Then inspect the COMPLETE folder structure.

Check:

- Root folders
- Frontend folders
- Backend folders
- Prisma folders
- Database files
- Public folders
- Assets
- Components
- Pages
- Routes
- Services
- Controllers
- Middleware
- Utilities
- Context
- Hooks
- API services
- Authentication
- PDF generation
- Validation
- Business logic
- Configuration
- Documentation
- README files
- Environment files
- package.json
- package-lock files
- Vite configuration
- Prisma configuration
- Migration files
- Seed files
- Existing screenshots

There may be multiple old folders.

For example:

- frontend
- FE
- backend
- BE

Do NOT assume which folder is active.

Inspect package.json and actual imports/configuration to identify the
CURRENT active frontend and backend.

============================================================
PHASE 2 — FILE-BY-FILE ANALYSIS
============================================================

Inspect all important source files.

FRONTEND:

Check:

- package.json
- entry point
- App
- routes
- pages
- components
- contexts
- hooks
- API services
- forms
- validations
- tables
- modals
- CSS
- Bootstrap
- React Icons
- authentication
- protected routes
- PDF-related frontend code

BACKEND:

Check:

- package.json
- server entry
- Express configuration
- routes
- controllers
- services
- middleware
- authentication
- validation
- error handling
- Prisma client
- PDF generation
- calculation logic

DATABASE:

Check:

- Prisma schema
- migrations
- models
- relations
- foreign keys
- unique constraints
- indexes
- enums
- seed files

CONFIGURATION:

Check:

- .env
- .env.example
- database configuration
- API URL
- frontend/backend ports
- authentication configuration

Never expose real secrets, passwords, tokens or credentials.

============================================================
PHASE 3 — IDENTIFY ACTUAL APPLICATION MODULES
============================================================

Read the actual frontend routes and backend routes.

Create an internal list of ALL currently implemented modules.

Check whether the project contains:

- Login
- Dashboard
- Customers
- Industries / Companies
- Sites / Locations
- Shutters
- Quotations
- Quotation Create
- Quotation View
- Quotation Edit
- Payments
- Payment History
- Company Settings
- Quotation Terms
- User/Profile
- Change Password
- PDF Preview
- Other modules

IMPORTANT:

Only document modules that actually exist.

If a module does not exist:

DO NOT create it.

DO NOT create a fake screenshot.

DO NOT document it as implemented.

============================================================
PHASE 4 — DATABASE ANALYSIS
============================================================

Inspect the CURRENT Prisma schema.

Identify every actual model.

For each model understand:

- Model name
- Purpose
- Fields
- Data types
- Required fields
- Optional fields
- Primary key
- Foreign keys
- Relations
- Unique constraints
- Indexes
- Cascade behavior

Understand the actual relationships.

For example, if the current project implements:

Customer
↓
Industry
↓
Site
↓
Shutter

and:

Customer
↓
Quotation
↓
Quotation Item
↓
Payment

Then document it.

But DO NOT assume these relationships.

Use the current Prisma schema as the source of truth.

============================================================
PHASE 5 — API ANALYSIS
============================================================

Inspect every actual backend route.

Document internally:

- HTTP method
- Endpoint
- Purpose
- Authentication
- Request body
- Response
- Validation
- Error handling

Only document actual endpoints.

Do NOT invent APIs.

============================================================
PHASE 6 — BUSINESS LOGIC ANALYSIS
============================================================

Inspect the CURRENT implementation of all important business logic.

Especially inspect:

- Shutter calculation
- Height
- Width
- Height FT
- Width FT
- Over Height
- Over Width
- Cover Size
- Total Sq.Ft.
- Rate
- GI Top Cover
- Gear Price
- Motor Price
- Transportation
- Additional Charges
- Discount
- GST
- Final Total
- Payment calculation
- Total Paid
- Pending Amount
- Quotation numbering
- Quotation editing
- PDF generation

Do NOT modify any business logic.

Do NOT assume previous calculation rules are still used.

The current code is the source of truth.

============================================================
PHASE 7 — RUN APPLICATION FROM SCRATCH
============================================================

Inspect actual package.json files first.

Determine the correct commands from the existing project.

Do NOT guess commands.

Start all required services.

Verify:

- PostgreSQL
- Backend
- Frontend
- Prisma
- API connection
- Authentication
- Browser accessibility

If application startup fails:

Document the actual problem.

Do NOT modify application code to bypass the problem.

============================================================
PHASE 8 — REAL BROWSER
============================================================

Open the actual running application in a real browser.

ALL functional testing must happen through the real browser UI.

Do NOT use:

- Fake UI
- Mock UI
- Generated UI
- Static HTML screenshots
- AI-generated screenshots
- Photoshop mockups
- Artificial screenshots

Every screenshot MUST come from the actual running application.

============================================================
PHASE 9 — VERY IMPORTANT
ALL TEST DATA MUST BE ENTERED FROM FRONTEND
============================================================

THIS IS A STRICT REQUIREMENT.

ALL dummy/test data MUST be created through the actual FRONTEND UI.

The only allowed flow is:

REAL BROWSER
↓
FRONTEND FORM
↓
FRONTEND API
↓
BACKEND
↓
PRISMA
↓
POSTGRESQL

DO NOT create test data directly using:

- PostgreSQL
- pgAdmin
- Prisma Studio
- SQL
- SQL scripts
- Prisma seed
- Node scripts
- Backend scripts
- Postman
- Thunder Client
- curl
- Direct API calls
- REST clients
- Database scripts

The purpose is to test the application exactly like a real user.

============================================================
PHASE 10 — TEST DATA
============================================================

Use fictional Gujarat-based business data.

Do NOT use real people's personal information.

Use dummy data such as:

Customer:

Shree Ganesh Engineering Pvt. Ltd.

Mobile:

9876543210

Address:

GIDC Vatva, Ahmedabad, Gujarat

GST:

24ABCDE1234F1Z5

Industry:

Shree Ganesh Engineering Unit

Address:

GIDC Vatva, Ahmedabad, Gujarat

Contact Person:

Rajesh Patel

Mobile:

9876543211

Site:

Vatva Manufacturing Plant

Address:

GIDC Phase 2, Vatva

City:

Ahmedabad

Other dummy Gujarat locations can be:

- Ahmedabad
- Vadodara
- Surat
- Rajkot
- Gandhinagar
- Bharuch
- Ankleshwar
- Vapi
- Mehsana

All data must be entered through the frontend UI.

============================================================
PHASE 11 — CHECK EVERY INPUT FIELD
============================================================

THIS IS MANDATORY.

For EVERY form in EVERY implemented module:

Check EVERY available field.

Do NOT skip any field.

Check:

- Text fields
- Number fields
- Date fields
- Dropdowns
- Selects
- Radio buttons
- Checkboxes
- Toggles
- Textareas
- Search fields
- File upload fields
- Dynamic fields
- Conditional fields
- Calculated fields
- Read-only fields
- Required fields
- Optional fields
- Submit buttons
- Save buttons
- Update buttons
- Cancel buttons
- Reset buttons

For every field:

1. Identify its purpose.
2. Enter appropriate test data.
3. Verify the value.
4. Submit/save.
5. Verify the saved value.
6. Open View if available.
7. Open Edit if available.
8. Verify the value again.
9. Update the field where appropriate.
10. Save.
11. Verify the updated value.

============================================================
PHASE 12 — VALIDATION TESTING
============================================================

Test important validation cases through the real frontend.

Examples:

- Empty required field
- Invalid mobile number
- Invalid GST
- Invalid amount
- Invalid dimension
- Invalid date
- Invalid selection
- Invalid payment amount
- Invalid quotation data
- Invalid login
- Duplicate value where applicable

For each validation:

Check:

EXPECTED RESULT
vs
ACTUAL RESULT

Do not change the validation code.

============================================================
PHASE 13 — LOGIN & AUTHENTICATION
============================================================

Open the actual login screen.

Test:

- Login form
- Required fields
- Invalid credentials
- Successful login
- Protected routes
- Logout
- Session/auth persistence if implemented

Capture actual screenshots.

Never show actual passwords.

============================================================
PHASE 14 — DASHBOARD
============================================================

After login:

Open Dashboard.

Use the dummy data created through frontend.

Verify actual dashboard information.

Check whatever is actually displayed, such as:

- Total Customers
- Total Industries
- Total Sites
- Total Shutters
- Total Quotations
- Total Quotation Amount
- Total Paid
- Total Pending
- Recent Quotations

Only document what actually exists.

Capture actual screenshot.

============================================================
PHASE 15 — CUSTOMER MODULE
============================================================

Open Customers.

Test:

- List
- Search
- Add
- Every field
- Required validation
- Save
- View
- Edit
- Delete if implemented

Create dummy customer ONLY through frontend.

Capture useful screenshots.

============================================================
PHASE 16 — INDUSTRY / COMPANY MODULE
============================================================

Open Industries / Companies.

Test:

- List
- Search
- Add
- Every field
- Validation
- Save
- View
- Edit
- Delete if implemented

Create dummy industry ONLY through frontend.

Capture screenshots.

============================================================
PHASE 17 — SITE / LOCATION MODULE
============================================================

Open Sites.

Test:

- List
- Search
- Add
- Every field
- Validation
- Save
- View
- Edit
- Delete if implemented

Create dummy site ONLY through frontend.

Capture screenshots.

============================================================
PHASE 18 — SHUTTER MODULE
============================================================

Open Shutters.

Test every actual shutter type implemented.

If available, test:

- Manual
- Gear
- Motorised

Check:

- Height
- Width
- Shutter Type
- Fitting Type
- Rate
- GI Top Cover Rate
- Gear Price
- Motor Price
- GST
- Remark
- Dynamic fields
- Conditional fields

Verify that fields show/hide correctly.

Create shutter records ONLY through frontend.

Capture actual screenshots.

============================================================
PHASE 19 — SHUTTER CALCULATION
============================================================

Use the actual application calculation.

Enter dimensions/rates through frontend.

Verify actual displayed calculations.

Check whatever fields are implemented:

- Height
- Width
- Height FT
- Width FT
- Over Height
- Over Width
- Cover Size
- Total Sq.Ft.
- Rate
- Shutter Basic
- GI Top Cover
- Gear/Motor
- GST
- Final Amount

Do NOT manually create fake calculation screenshots.

Capture the actual calculation screen.

============================================================
PHASE 20 — QUOTATION MODULE
============================================================

Open Quotations.

Test:

- List
- Search
- Create
- Customer selection
- Industry selection
- Site selection
- Shutter selection
- Multiple shutters if supported
- Calculations
- Additional charges if implemented
- Discount if implemented
- GST if implemented
- Save
- View
- Edit
- Update
- PDF

Create quotation ONLY through frontend.

Capture actual screenshots.

============================================================
PHASE 21 — QUOTATION EDIT
============================================================

Open a saved quotation.

Click Edit.

Change a valid field.

Save.

Verify:

- Updated value
- Updated calculation
- Updated total
- Updated quotation display
- Updated PDF data

Capture useful screenshots.

============================================================
PHASE 22 — QUOTATION SEARCH
============================================================

Test every actual quotation search/filter.

If implemented, test:

- Customer
- Mobile
- Industry
- Quotation number
- Date

Use frontend UI only.

Capture useful screenshot.

============================================================
PHASE 23 — QUOTATION PDF
============================================================

Generate the actual quotation PDF through the application.

Do NOT create a fake PDF.

Open the generated PDF.

Check actual content:

- Company header
- Logo
- Quotation number
- Date
- Customer
- Industry
- Site
- Shutter details
- Calculation
- GST
- Additional charges
- Discount
- Final amount
- Terms
- Signature
- Page layout

Capture actual PDF page screenshots.

============================================================
PHASE 24 — PAYMENT MODULE
============================================================

Open Payments.

Create payment ONLY through frontend UI.

Test every actual payment field.

If supported, test actual payment methods.

Check:

- Payment date
- Payment amount
- Payment method
- Transaction number
- Cheque number
- Remark
- Total paid
- Pending amount
- Payment history

Capture actual screenshots.

============================================================
PHASE 25 — COMPANY SETTINGS
============================================================

If Company Settings exists:

Open it.

Check EVERY field.

Test:

- Company name
- Address
- Mobile
- GST
- Logo
- Other actual fields

Capture actual screenshot.

Do not expose secrets.

============================================================
PHASE 26 — QUOTATION TERMS
============================================================

If quotation terms exist:

Open the module.

Check every available field.

Test Add/Edit/Save if implemented.

Capture screenshots.

============================================================
PHASE 27 — OTHER ACTUAL MODULES
============================================================

If any additional module exists in the current application:

Inspect it.

Test it.

Check every field.

Enter dummy data through frontend where applicable.

Capture screenshots.

Document it in README.

============================================================
PHASE 28 — SCREENSHOT STORAGE
============================================================

Create a clean screenshot structure.

Use:

FE/public/screenshots/

Suggested structure:

FE/public/screenshots/
├── 01-auth/
├── 02-dashboard/
├── 03-customers/
├── 04-industries/
├── 05-sites/
├── 06-shutters/
├── 07-quotations/
├── 08-payments/
├── 09-settings/
├── 10-pdf/
└── 11-validation/

Use actual screenshots only.

Do not use fake screenshots.

Do not mix old and new screenshots.

============================================================
PHASE 29 — SCREENSHOT NAMING
============================================================

Use clear names.

Examples:

login.png
login-validation.png
dashboard.png

customers-list.png
customer-add.png
customer-filled.png
customer-created.png
customer-edit.png

industries-list.png
industry-add.png
industry-created.png

sites-list.png
site-add.png
site-created.png

shutters-list.png
shutter-manual.png
shutter-gear.png
shutter-motorised.png
shutter-calculation.png

quotations-list.png
quotation-create.png
quotation-calculation.png
quotation-view.png
quotation-edit.png
quotation-search.png
quotation-pdf-page-1.png
quotation-pdf-page-2.png

payments-list.png
payment-add.png
payment-history.png

company-settings.png
quotation-terms.png

Use only screens that actually exist.

============================================================
PHASE 30 — README.MD
MAIN PROJECT DOCUMENTATION
============================================================

README.md is the MAIN project documentation.

README.md MUST contain the main story/documentation of the
current application.

Include, where applicable:

# Swagat Industries ERP

## Overview

## Application Purpose

## Application Flow

## Key Features

## Technology Stack

## Architecture

## Project Structure

## Authentication

## Dashboard

## Customer Management

## Industry / Company Management

## Site / Location Management

## Shutter Management

## Shutter Calculation

## Quotation Management

## GST & Financial Calculations

## Additional Charges

## Discount / Adjustment

## Payment Management

## Company Settings

## Quotation Terms

## PDF Quotation

## API Documentation

## Database Schema

## Installation

## Environment Variables

## Database Setup

## Running the Application

## Testing

## Application Screenshots

## Security

## License

ONLY include sections supported by the actual project.

============================================================
PHASE 31 — README SCREENSHOTS
============================================================

README.md MUST contain actual screenshots from the running
application.

For each major module:

1. Add the actual screenshot.
2. Add a professional description.
3. Explain what the screen does.
4. Explain the main functionality visible in the screenshot.

Example:

## Customer Management

![Customer Management](./FE/public/screenshots/03-customers/customers-list.png)

### Description

The Customer Management screen provides the interface for viewing,
searching and managing customer records in the Swagat Industries ERP.

The screen displays the customer information currently available
in the application and provides the available actions implemented
in the current version.

Descriptions MUST match the actual UI.

Do not write descriptions for features that are not visible or
not implemented.

============================================================
PHASE 32 — README COMPLETE APPLICATION FLOW
============================================================

Document the actual application flow.

For example, if implemented:

Login
↓
Dashboard
↓
Customer
↓
Industry
↓
Site
↓
Shutter
↓
Quotation
↓
Payment
↓
PDF

For each actual step:

- Screenshot
- Description
- Main purpose
- Actual functionality

Do not add modules that do not exist.

============================================================
PHASE 33 — README TESTING DOCUMENTATION
============================================================

Add a concise Testing section.

Document:

- Application tested through real browser
- Actual frontend used
- Dummy data entered through frontend
- Input fields checked
- Validation tested
- Dynamic fields tested
- Calculations tested
- PDF tested
- Payment flow tested
- Screenshots captured from actual application

Do NOT put detailed bug reports here.

============================================================
PHASE 34 — ERRORS.MD
ONLY ERROR / BUG DOCUMENTATION
============================================================

Create:

errors.md

at project root.

IMPORTANT:

errors.md is ONLY for errors and bugs.

If any issue is discovered during testing, document it here.

For every error:

## Error #1

### Module

Actual module

### Page / Screen

Actual page

### Field / Feature

Affected field/feature

### Error Type

Validation / UI / API / Database / Calculation / PDF /
Authentication / Other

### Steps to Reproduce

1. Actual step
2. Actual step
3. Actual step

### Expected Result

Actual expected behavior

### Actual Result

Actual observed behavior

### Error Message

Actual error message

### Severity

Critical / High / Medium / Low

### Screenshot

Actual error screenshot path if available

### Browser / Environment

Relevant information

### API / Backend Error

Only if applicable

### Database Error

Only if applicable

### Debugging Notes

Useful technical information

============================================================
PHASE 35 — README AND ERRORS.MD MUST STAY SEPARATE
============================================================

STRICT RULE:

README.md = MAIN PROJECT DOCUMENTATION

errors.md = ONLY ERROR / BUG DOCUMENTATION

Do NOT copy detailed errors into README.md.

Do NOT copy stack traces into README.md.

Do NOT copy debugging logs into README.md.

Do NOT copy reproduction steps into README.md.

README.md may contain only a short statement:

"During browser testing, identified issues are documented separately
in errors.md."

And a link:

[View Testing Errors](./errors.md)

Detailed error information belongs ONLY in errors.md.

============================================================
PHASE 36 — IF NO ERRORS ARE FOUND
============================================================

If no errors are found, create errors.md:

# Swagat Industries ERP — Testing Errors

## No Errors Found

No functional, validation, API, database, calculation, PDF,
authentication, or UI errors were identified during the completed
browser testing process.

README.md should NOT contain a fake error list.

README.md can simply state that testing was completed and provide:

[Testing Documentation](./errors.md)

============================================================
PHASE 37 — API DOCUMENTATION IN README
============================================================

Inspect actual backend routes.

Add an API table in README:

| Module | Method | Endpoint | Description | Auth |
| ------ | ------ | -------- | ----------- | ---- |

Only actual APIs.

Do NOT invent endpoints.

============================================================
PHASE 38 — DATABASE DOCUMENTATION IN README
============================================================

Document actual Prisma models.

Include:

- Model
- Purpose
- Important fields
- Relations

Use actual current schema.

Do not copy outdated database documentation.

============================================================
PHASE 39 — PROJECT STRUCTURE IN README
============================================================

Generate the actual current project tree.

Do NOT invent folder names.

Do NOT simplify the structure incorrectly.

README must represent the actual repository.

============================================================
PHASE 40 — INSTALLATION IN README
============================================================

Read actual package.json scripts.

Document:

- Prerequisites
- PostgreSQL
- Backend setup
- Frontend setup
- Environment variables
- Prisma setup
- Migration
- Seed only if actually used
- Backend run command
- Frontend run command

Do NOT guess commands.

============================================================
PHASE 41 — SCREENSHOT VERIFICATION
============================================================

Before completing:

Check EVERY screenshot.

For each screenshot:

[ ] File exists
[ ] Correct screenshot
[ ] Actual application
[ ] Correct folder
[ ] Correct filename
[ ] README path correct
[ ] Image opens
[ ] Description matches screenshot
[ ] No fake screenshot
[ ] No sensitive data exposed

There must be NO broken screenshot links in README.md.

============================================================
PHASE 42 — FINAL PROJECT VERIFICATION
============================================================

Before finishing verify:

[ ] Complete project structure inspected
[ ] Important files inspected
[ ] Frontend inspected
[ ] Backend inspected
[ ] Prisma inspected
[ ] Database inspected
[ ] API routes inspected
[ ] Authentication inspected
[ ] Business logic inspected
[ ] Application started
[ ] Real browser opened
[ ] Login tested
[ ] Dashboard tested
[ ] Every actual module identified
[ ] Every actual module tested
[ ] All test data entered through frontend
[ ] No direct DB test data insertion
[ ] No direct API test data insertion
[ ] Every available input field checked
[ ] Validation tested
[ ] Dynamic fields tested
[ ] Calculations tested
[ ] Quotation tested
[ ] PDF tested
[ ] Payment tested
[ ] Settings tested
[ ] Real screenshots captured
[ ] README updated
[ ] Screenshot descriptions added
[ ] Screenshot links verified
[ ] errors.md created
[ ] All discovered errors documented
[ ] No detailed errors duplicated into README
[ ] No secrets exposed
[ ] No real personal data exposed
[ ] No application code modified
[ ] No business logic modified

============================================================
PHASE 43 — FINAL REPORT
============================================================

At the end provide:

## PROJECT ANALYSIS

Frontend:
Backend:
Database:
Authentication:
API:
Modules:

## APPLICATION TESTING

Application Started:
Browser Tested:
Login:
Dashboard:
Modules Tested:

## FRONTEND DATA ENTRY

All test data entered through frontend:
YES / NO

Direct database insertion:
YES / NO

Direct API insertion:
YES / NO

## INPUT FIELD TESTING

Forms Tested:
Input Fields Checked:
Validation Tested:
Dynamic Fields Tested:
Conditional Fields Tested:

## SCREENSHOTS

Total Screenshots:
Screenshot Folders:
PDF Screenshots:
Validation Screenshots:

## DOCUMENTATION

README.md:
Updated / Not Updated

README Screenshots:
Added / Not Added

Screenshot Descriptions:
Added / Not Added

errors.md:
Created / Not Created

## ERRORS

Critical:
High:
Medium:
Low:
Total:

## FINAL STATUS

Clearly state:

- What was tested
- What was successfully verified
- What could not be tested
- What errors were found
- Where errors are documented
- How many screenshots were created
- Whether README was updated
- Whether all screenshot paths were verified

============================================================
FINAL RULE
============================================================

DO NOT START A NEW DEVELOPMENT PHASE.

DO NOT FIX BUGS DURING THIS TASK.

DO NOT CHANGE APPLICATION CODE.

DO NOT CREATE FAKE DATA THROUGH DATABASE/BACKEND.

DO NOT CREATE FAKE SCREENSHOTS.

DO NOT INVENT FEATURES.

Complete the task in this exact order:

1. Inspect entire project
2. Inspect all important files
3. Understand current architecture
4. Run application
5. Open real browser
6. Login
7. Enter dummy data ONLY through frontend
8. Check EVERY input field
9. Test every actual module
10. Test validations
11. Test calculations
12. Test quotation
13. Test PDF
14. Test payments
15. Capture real screenshots
16. Create errors.md for actual errors
17. Update README.md with MAIN project content
18. Add screenshots + descriptions to README.md
19. Verify all README screenshot links
20. Provide final report
21. STOP

IMPORTANT DOCUMENTATION RULE:

README.md = MAIN PROJECT CONTENT + REAL SCREENSHOTS + DESCRIPTIONS

errors.md = ONLY ERRORS + BUGS + DEBUGGING INFORMATION

Keep these two files separate.
