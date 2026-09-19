PHASE 11 — COMPANY SETTINGS

Implement Company Settings.

Fields:

- Company Name
- Logo
- Address
- Mobile
- GST No.

Quotation terms must also be configurable.

Company information should automatically apply to NEW quotations/PDFs.

Existing quotation information must remain historically appropriate.

---

### Distinct 3-Card Section Architecture

To ensure clean visual hierarchy and scannability, the Company Settings interface is organized into 3 distinct, standalone card sections:

1. **Card 1: Company Information**
   - Core company profile fields: Company Name, Mobile Number, Alternate Mobile, GSTIN (15-character uppercase format with real-time keyup validation), PAN No., Email Address, Website, Logo URL, Address, City/State/Pincode.
   - Distinct header with `FiBriefcase` icon and dedicated save action button.

2. **Card 2: Bank Account Information**
   - Standalone section card for financial payment processing fields: Bank Name, Account No., IFSC Code, Branch Name.
   - Distinct header with `FiCreditCard` icon and dedicated save action button.

3. **Card 3: Configurable Quotation Terms & Conditions**
   - Positioned as a distinct third card directly **BELOW** Bank Account Information.
   - Includes interactive term management: Order sorting (#), Term Title, Term Text/Clause, Active/Inactive status toggle, and Edit/Delete modal actions.

Do not add unnecessary company settings.

Test:

- update company information
- update bank account details
- update quotation terms
- create new quotation
- verify new PDF information

Wait for confirmation.
