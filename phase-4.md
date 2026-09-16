PHASE 4 — SHUTTER CALCULATION ENGINE

Now implement ONLY the shutter calculation engine.

Use this business logic exactly.

Input:

Height in inches
Width in inches

Convert:

HEIGHT_FT = ROUND(HEIGHT / 12, 2)

WIDTH_FT = ROUND(WIDTH / 12, 2)

MANUAL:

OVER_HEIGHT = HEIGHT_FT + 1.50

OVER_WIDTH = WIDTH_FT + 0.50

COVER_SIZE = OVER_WIDTH + 0.50

GEAR:

OVER_HEIGHT = HEIGHT_FT + 2.00

OVER_WIDTH = WIDTH_FT + 0.75

COVER_SIZE = OVER_WIDTH + 0.75

MOTORISED:

OVER_HEIGHT = HEIGHT_FT + 2.00

OVER_WIDTH = WIDTH_FT + 0.75

COVER_SIZE = OVER_WIDTH + 0.75

TOTAL_SQFT:

OVER_HEIGHT × OVER_WIDTH

SHUTTER_BASIC:

(TOTAL_SQFT × RATE_PER_SQFT)

- GEAR_OR_MOTOR_PRICE

GI_TOP_COVER_BASIC:

COVER_SIZE × GI_TOP_COVER_RATE_PER_SQFT

Quotation-level Transportation is separate.

GST applies to transportation.

Transportation is included in GST base.

Frontend:

Show live calculation.

Backend:

Must recalculate independently.

Never trust frontend totals.

Create reusable calculation functions.

Use Decimal/precise numeric handling for financial calculations.

Test:

- Manual
- Gear
- Motorised
- GST Yes
- GST No
- different dimensions
- different rates

Do not build PDF yet.

Wait for confirmation.
