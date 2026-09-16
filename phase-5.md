PHASE 5 — QUOTATION CREATION

Now implement the quotation creation module.

User must be able to:

- select Customer
- select Industry
- select Site
- select one or multiple shutters
- select all shutters

Use current shutter master data as initial quotation values.

After quotation creation, store quotation-specific values in quotation_items.

Quotation must be independent from the current shutter master.

Quotation table columns must be exactly:

1. Sr No.
2. Height
3. Width
4. Over Height
5. Over Width
6. Total Sqft
7. GI Top Cover R. Ft
8. Rate Per Sqft
9. GI Top Cover Rate Per Sqft
10. Basic Total
11. Transportation
12. GST
13. Final Total

Transportation is quotation-level.

Do NOT repeat transportation for every shutter.

Quotation-level fields:

- Transportation
- Additional Charges
- Discount / Adjustment
- GST

Calculate:

TOTAL_BASIC =
Shutter Basic

- GI Top Cover
- Transportation
- Additional Charges

* Discount/Adjustment

GST:

GST_AMOUNT =
TOTAL_BASIC × GST_PERCENT / 100

FINAL_TOTAL =
TOTAL_BASIC + GST_AMOUNT

GST must include transportation in its base.

Quotation number:

SI + YYYYMMDD + Daily Serial

Examples:

SI20260915-001
SI20260915-002
SI20260916-001

Daily serial resets every day.

Generate quotation number safely on backend.

Prevent duplicates.

Do not build quotation PDF yet.

Test quotation creation thoroughly.

Wait for confirmation.
