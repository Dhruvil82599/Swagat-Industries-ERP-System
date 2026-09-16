PHASE 3 — MASTER DATA MODULES

Now implement the master data modules.

Frontend:
React + Vite + Bootstrap

Backend:
Use the APIs created in Phase 2.

Implement:

1. Customer
2. Industry / Company
3. Site / Location
4. Shutter

Navigation:

Customers
↓
Industries
↓
Sites
↓
Shutters

CUSTOMER:

Fields:

- Customer Name
- Mobile Number
- Address
- GST No.

Functions:

- Add
- Edit
- View
- Delete
- Search

Search:

- Name
- Mobile

INDUSTRY:

Fields:

- Industry / Company Name
- GST No.
- Address
- Contact Person
- Mobile No.

Must belong to a Customer.

SITE:

Fields:

- Site Name
- Site Address
- City / Location
- Contact Person
- Mobile No.
- Remark

Must belong to Industry.

SHUTTER:

Fields:

- Shutter Name / No.
- Height
- Width
- Shutter Type
- Fitting Type
- Rate Per Sq.Ft.
- GI Top Cover Rate Per Sq.Ft.
- Gear Price
- Motor Price
- GST Applicable
- Remark

Shutter Type:

- Manual
- Gear
- Motorised

Fitting:

- A Type
- B Type

Dynamic fields:

Manual:
hide Gear/Motor price

Gear:
show Gear Price
hide Motor Price

Motorised:
show Motor Price
hide Gear Price

GST Yes:
show GST calculation

GST No:
hide GST calculation

Create professional responsive UI.

Do not build quotation or payment yet.

Test CRUD completely.

Wait for confirmation.
