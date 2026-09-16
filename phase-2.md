PHASE 2 — NODE.JS + EXPRESS BACKEND

Now implement ONLY the backend.

Technology:

Node.js
Express.js
Prisma Client
PostgreSQL

Do not modify the business requirements.

Create:

backend/

Use:

.env

Example:

DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/swagat_erp"

PORT=5000

Never hardcode database credentials.

Create REST APIs for:

/api/customers
/api/industries
/api/sites
/api/shutters
/api/quotations
/api/payments
/api/company-settings
/api/quotation-terms

Implement:

GET
POST
PUT
DELETE

where appropriate.

Implement:

- validation
- centralized error handling
- consistent JSON responses
- Prisma Client
- database transactions where required

Customer validation:

- name required
- mobile exactly 10 digits
- address required

Industry:

- name required
- address required
- optional valid mobile

Site:

- name required
- address required
- city/location required

Shutter:

- height > 0
- width > 0
- numeric values
- no negative rates/prices
- valid shutter type
- valid fitting type
- GST Yes/No

Payment:

- amount > 0
- valid payment method
- UPI transaction number required for UPI
- cheque number required for Cheque

Do not build frontend yet.

Test all APIs.

After implementation show:

- API structure
- endpoint list
- sample requests/responses
- database connection status

Then wait for confirmation.
