const { prisma } = require('./src/config/db');
const { calculateQuotationSummary } = require('./src/utils/calculator');
const { generateQuotationNumber } = require('./src/utils/quotationNumber');

async function runPhase5Tests() {
  console.log('================================================================');
  console.log('      SWAGAT INDUSTRIES ERP — PHASE 5 QUOTATION CREATION TESTS ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assertEqual(actual, expected, testName) {
    if (actual === expected) {
      console.log(`✔ [PASS] ${testName}: ${actual}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}: Expected ${expected}, got ${actual}`);
      failed++;
    }
  }

  try {
    // TEST 1: FINANCIAL SUMMARY CALCULATIONS WITH TRANSPORTATION & GST
    console.log('--- TEST 1: QUOTATION SUMMARY CALCULATION (Including Transportation & GST) ---');
    const sampleItems = [
      {
        height_inches: 120, // 10 ft -> Over: 11.50
        width_inches: 96,   // 8 ft  -> Over: 8.50 -> Sqft: 97.75, Cover: 9.00
        shutter_type: 'Manual',
        fitting_type: 'A Type',
        rate_per_sqft: 250, // Shutter Basic = 24437.50
        gi_top_cover_rate_per_sqft: 80 // Cover Basic = 720.00
      }
    ];

    // Total Shutter Basic = 24437.50
    // Total GI Cover Basic = 720.00
    // Transportation = ₹1500.00
    // Additional Charges = ₹500.00
    // Discount = ₹200.00
    // Total Basic = 24437.50 + 720.00 + 1500 + 500 - 200 = ₹26,957.50
    // GST (18%) = 26957.50 * 0.18 = ₹4,852.35
    // Final Total = 26957.50 + 4852.35 = ₹31,809.85

    const summary = calculateQuotationSummary({
      items: sampleItems,
      transportation: 1500,
      additionalCharges: [{ description: 'Installation', amount: 500 }],
      discountAmount: 200,
      gstApplicable: true,
      gstPercent: 18.00
    });

    assertEqual(summary.shutterBasicTotal, 24437.50, 'Shutter Basic Total');
    assertEqual(summary.giTopCoverTotal, 720.00, 'GI Top Cover Total');
    assertEqual(summary.transportationCharges, 1500.00, 'Transportation Charges');
    assertEqual(summary.additionalChargesTotal, 500.00, 'Additional Charges Total');
    assertEqual(summary.discountAmount, 200.00, 'Discount Amount');
    assertEqual(summary.totalBasic, 26957.50, 'Total Basic (Includes Transportation)');
    assertEqual(summary.gstAmount, 4852.35, 'GST 18% Amount');
    assertEqual(summary.finalTotal, 31809.85, 'Final Total');
    console.log('');

    // TEST 2: QUOTATION NUMBER GENERATION & DAILY SERIAL RESET
    console.log('--- TEST 2: QUOTATION NUMBER GENERATION ---');
    const today = new Date();
    const yyyy = today.getFullYear().toString();
    const mm = (today.getMonth() + 1).toString().padStart(2, '0');
    const dd = today.getDate().toString().padStart(2, '0');
    const expectedPrefix = `SI${yyyy}${mm}${dd}`;

    const qNo1 = await generateQuotationNumber(today);
    console.log(`Generated Quotation Number: ${qNo1}`);
    if (qNo1.startsWith(expectedPrefix)) {
      console.log(`✔ [PASS] Quotation Number Prefix Matches: ${expectedPrefix}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] Expected prefix ${expectedPrefix}, got ${qNo1}`);
      failed++;
    }
    console.log('');

    // SUMMARY
    console.log('================================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================');

    await prisma.$disconnect();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal Test Error:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

runPhase5Tests();
