# Swagat ERP - Development Error & Testing Log

## Phase 4: Employee Attendance Module

### 1. Check Out Time Before Check In Time
- **Error Description**: User attempts to save daily attendance where Check Out time is earlier than Check In time (e.g. Check In 18:00, Check Out 09:00).
- **Reproduction**: Enter Check In `18:00` and Check Out `09:00` for a PRESENT status employee on Daily Attendance screen and submit save.
- **Root Cause**: Invalid time sequence in client input.
- **Fix Applied**: Added validation in `attendanceController.js` (`validateAttendanceRecord`) and frontend pre-submission checks in `DailyAttendancePage.jsx`.
- **Testing Result**: API rejects request with HTTP 400 Bad Request and message `"Check Out time cannot be earlier than Check In time"`. Frontend displays toast warning.

### 2. File Lock during Prisma Generation on Windows
- **Error Description**: `EPERM: operation not permitted, rename query_engine-windows.dll.node.tmp` during `npx prisma generate`.
- **Reproduction**: Run `npx prisma db push` while `npm run dev` backend node process is running on Windows.
- **Root Cause**: The running Node.js process keeps an open file handle lock on Prisma's C++ native binary query engine.
- **Fix Applied**: Stopped background Node server prior to `npx prisma generate`, successfully re-generated Prisma Client, and restarted backend dev server.
- **Testing Result**: Prisma Client (v6.19.3) generated cleanly and database schema updated.

### 3. Missing Check In / Check Out for Present Status
- **Error Description**: Submitting attendance with status `PRESENT` without providing Check In or Check Out time.
- **Reproduction**: Set status to `PRESENT` and clear Check In or Check Out fields.
- **Root Cause**: Missing required time fields for Present status.
- **Fix Applied**: Enforced strict validation requiring both `checkIn` and `checkOut` when status is `PRESENT`.
- **Testing Result**: Rejects submission with 400 validation error specifying required fields.

## Phase 7: Employee Salary Payment Module

### 1. Overpayment Validation (Payment Amount > Remaining Balance)
- **Error Description**: User attempts to record a salary payment amount greater than the remaining net salary balance.
- **Reproduction**: Net Salary = ₹30,000, Already Paid = ₹15,000; submit new payment of ₹20,000.
- **Root Cause**: Input payment amount exceeds remaining net salary balance.
- **Fix Applied**: Implemented overpayment calculation check in `salaryPaymentController.js` and real-time client-side validation in `EmployeeSalaryPaymentPage.jsx`.
- **Testing Result**: Request rejected with HTTP 400 Bad Request: `"Payment amount (₹20,000) cannot exceed remaining net salary balance of ₹15,000. Net Salary: ₹30,000, Already Paid: ₹15,000"`.

### 2. Status Recalculation after Payment Deletion / Modification
- **Error Description**: Salary status might remain `FULLY PAID` even if a payment is deleted or reduced.
- **Reproduction**: Record full payment, then delete one payment installment.
- **Root Cause**: Stale status string if not recalculated across remaining transaction history.
- **Fix Applied**: Created database helper `updateSalaryStatusAfterPayment` that recalculates total payments and updates `EmployeeSalary` status automatically to `UNPAID`, `PARTIALLY PAID`, or `FULLY PAID`.
- **Testing Result**: Status dynamically transitions from `FULLY PAID` -> `PARTIALLY PAID` -> `UNPAID` accurately.

