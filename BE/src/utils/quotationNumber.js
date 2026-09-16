const { prisma } = require("../config/db");

/**
 * Generate a safe, sequential quotation number for the day.
 * Format: SI + YYYYMMDD + - + 3-digit serial (e.g., SI20260915-001)
 * Resets every day.
 */
async function generateQuotationNumber(customDate = null) {
  const targetDate = customDate ? new Date(customDate) : new Date();

  const yyyy = targetDate.getFullYear().toString();
  const mm = (targetDate.getMonth() + 1).toString().padStart(2, "0");
  const dd = targetDate.getDate().toString().padStart(2, "0");

  const datePrefix = `SI${yyyy}${mm}${dd}`;

  // Find all quotations generated for this date
  const dayQuotations = await prisma.quotation.findMany({
    where: {
      quotationNo: {
        startsWith: `${datePrefix}-`,
      },
    },
    select: {
      quotationNo: true,
    },
  });

  let maxSerial = 0;
  for (const q of dayQuotations) {
    if (q.quotationNo) {
      const parts = q.quotationNo.split("-");
      if (parts.length >= 2) {
        const serial = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(serial) && serial > maxSerial) {
          maxSerial = serial;
        }
      }
    }
  }

  const nextSerial = maxSerial + 1;
  const formattedSerial = nextSerial.toString().padStart(3, "0");
  return `${datePrefix}-${formattedSerial}`;
}

module.exports = {
  generateQuotationNumber,
};
