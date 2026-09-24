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
