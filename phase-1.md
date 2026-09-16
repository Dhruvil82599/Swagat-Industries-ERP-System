PHASE 1 — POSTGRESQL DATABASE + PRISMA

Now implement ONLY the database layer.

Technology:

PostgreSQL
Prisma ORM

Database name:

swagat_erp

DO NOT use MySQL.
DO NOT use MongoDB.

Create the Prisma project/schema.

Required entities:

1. customers
2. industries
3. sites
4. shutters
5. quotations
6. quotation_items
7. additional_charges
8. payments
9. company_settings
10. quotation_terms

Relationships:

Customer
↓ 1:N
Industry
↓ 1:N
Site
↓ 1:N
Shutter

Customer
↓ 1:N
Quotation
↓ 1:N
Quotation Item

Quotation
↓ 1:N
Payment

Quotation
↓ 1:N
Additional Charges

Customer:

- id
- customer_name
- mobile_number
- address
- gst_no
- created_at
- updated_at

Industry:

- id
- customer_id
- industry_name
- gst_no
- address
- contact_person
- mobile_no
- created_at
- updated_at

Site:

- id
- industry_id
- site_name
- site_address
- city_location
- contact_person
- mobile_no
- remark
- created_at
- updated_at

Shutter:

- id
- site_id
- shutter_name_no
- height_inches
- width_inches
- shutter_type
- fitting_type
- rate_per_sqft
- gi_top_cover_rate_per_sqft
- gear_price
- motor_price
- gst_applicable
- remark
- created_at
- updated_at

Quotation:

Store quotation header information and quotation-level charges.

Quotation Item:

Store independent quotation-specific shutter values.

IMPORTANT:

Quotation items must NOT depend on the current shutter master values after quotation creation.

When a quotation is created, copy the required shutter values into quotation_items.

Quotation editing must replace the existing quotation values.

Quotation number remains unchanged.

Use PostgreSQL NUMERIC/DECIMAL through Prisma Decimal for financial values.

Use proper:

- primary keys
- foreign keys
- indexes
- unique constraints
- relations
- timestamps

Use Prisma migrations.

Create:

prisma/schema.prisma

Create proper migration.

Do not create frontend or backend API yet.

After implementation, show:

1. Prisma schema
2. Tables
3. Relationships
4. Migration result

Then wait for confirmation.
