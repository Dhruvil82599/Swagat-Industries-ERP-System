PHASE 10 — DASHBOARD

Now implement the Dashboard.

Keep it simple and professional.

### Master Data Operations Cards:
- Total Customers
- Total Industries / Companies
- Total Sites
- Total Shutters
- Total Quotations

### Separate Payment & Financial Overview Cards:
- **Total Quotation Value Card** (`Total Quotation Amount`): Displays total gross revenue value across all finalized quotations with green trend indicator (`#059669`).
- **Total Received Payments Card** (`Total Paid`): Displays total settled payment collections with success badge (`#16A34A`).
- **Outstanding Pending Balance Card** (`Total Pending`): Displays remaining receivable balance across active quotations with alert indicator (`#DC2626`).

Recent Quotations:

- Quotation No.
- Customer
- Date
- Amount
- PDF

Do not add unnecessary charts or analytics.

All dashboard numbers must come from PostgreSQL through backend APIs.

Do not use fake/mock data.

---

### Separate Payment-Related Card Architecture

Payment metrics are visually segregated into a dedicated **Payment & Financial Summary** section to optimize financial scannability:

1. **Visual Hierarchy & Sectioning**:
   - Master Data entity counters (Customers, Industries, Sites, Shutters, Quotation Counts) are grouped in an upper 5-card operational row.
   - Financial & Payment metrics are rendered in a distinct 3-column financial block below, complete with a dedicated header (`Payment & Financial Summary`) and shortcut link ("Manage Payments →").

2. **Distinct Card Styles & Accents**:
   - **Quotation Value Card**: Styled with a 5px emerald left border (`#059669`) and subtitle indicating gross billed totals.
   - **Received Payments Card**: Styled with a 5px success green left border (`#16A34A`) and collection status tag (`✓ Collected & recorded in system`).
   - **Pending Balance Card**: Styled with a 5px danger red left border (`#DC2626`) and warning tag (`⚠ Remaining receivable balance`).

3. **Interactive Navigation Shortcuts**:
   - Clicking on Payment cards directly redirects users to the dedicated `/payments` management workflow, while clicking on Total Quotations redirects to `/quotations`.

---

### Dashboard Hover Effects & Micro-Interactions

To enhance user experience and visual interactivity, dynamic CSS hover effects have been implemented across all dashboard metric cards:

1. **Card Elevation & Smooth Y-Translate**:
   - On hover, each summary stat card smoothly elevates upwards by `-4px` (`transform: translateY(-4px)`).
   - Applied smooth cubic-bezier easing (`transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)`).

2. **Soft Depth Shadow & Border Highlight**:
   - Box shadow expands on hover (`box-shadow: 0 12px 24px -4px rgba(30, 43, 88, 0.12)`) to provide elevation perception.
   - Subtle border color shift (`border-color: #CBD5E1`) reinforces card focus.

3. **Icon Scaling Animation**:
   - The icon wrapper inside the hovered card scales up slightly by `1.10x` (`transform: scale(1.10)`), providing an instant responsive affordance to user hover.

Wait for confirmation.
