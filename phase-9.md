PHASE 9 — PAYMENT MODULE

Now implement the Payment module.

One quotation can have multiple payments.

Payment methods:

- Cash
- Google Pay
- UPI
- Cheque

Payment fields:

- Quotation No.
- Customer
- Industry
- Site
- Payment Date
- Payment Amount
- Payment Method
- Transaction No. for UPI
- Cheque No. for Cheque
- Remark

Automatic:

Final Payable
Total Paid
Pending Amount

Formula:

PENDING =
FINAL_PAYABLE - TOTAL_PAID

Validation:

- Payment > 0
- UPI transaction number required for UPI
- Cheque number required for Cheque
- Prevent payment exceeding pending amount unless configuration allows it

Show payment history for each quotation.

Do not modify quotation numbering or calculation rules.

Test multiple payments for one quotation.

Wait for confirmation.
