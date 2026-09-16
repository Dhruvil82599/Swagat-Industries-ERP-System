const { calculateShutterItem, calculateQuotationSummary, roundTo } = require('./src/utils/calculator');

function runPhase4Tests() {
  console.log('================================================================');
  console.log('      SWAGAT INDUSTRIES ERP — PHASE 4 CALCULATION ENGINE TESTS  ');
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

  // TEST 1: MANUAL SHUTTER (120" x 96")
  console.log('--- TEST 1: MANUAL SHUTTER (120" x 96", Rate: ₹250, GI Cover Rate: ₹80) ---');
  // Height = 120 / 12 = 10.00 ft
  // Width = 96 / 12 = 8.00 ft
  // Manual Over Height = 10.00 + 1.50 = 11.50 ft
  // Manual Over Width = 8.00 + 0.50 = 8.50 ft
  // Total SqFt = 11.50 * 8.50 = 97.75 sq.ft
  // Cover Size = 8.50 + 0.50 = 9.00 ft
  // Shutter Basic = 97.75 * 250 = ₹24,437.50
  // GI Cover Basic = 9.00 * 80 = ₹720.00
  // Basic Total = 24437.50 + 720.00 = ₹25,157.50
  const manualResult = calculateShutterItem({
    height_inches: 120,
    width_inches: 96,
    shutter_type: 'Manual',
    fitting_type: 'A Type',
    rate_per_sqft: 250,
    gi_top_cover_rate_per_sqft: 80
  });

  assertEqual(manualResult.heightFt, 10, 'Manual Height Ft');
  assertEqual(manualResult.widthFt, 8, 'Manual Width Ft');
  assertEqual(manualResult.overHeight, 11.50, 'Manual Over Height');
  assertEqual(manualResult.overWidth, 8.50, 'Manual Over Width');
  assertEqual(manualResult.coverSize, 9.00, 'Manual Cover Size');
  assertEqual(manualResult.totalSqft, 97.75, 'Manual Total SqFt');
  assertEqual(manualResult.shutterBasic, 24437.50, 'Manual Shutter Basic');
  assertEqual(manualResult.giTopCoverBasic, 720.00, 'Manual GI Cover Basic');
  assertEqual(manualResult.basicTotal, 25157.50, 'Manual Basic Total');
  console.log('');

  // TEST 2: GEAR SHUTTER (144" x 120")
  console.log('--- TEST 2: GEAR SHUTTER (144" x 120", Rate: ₹260, GI Cover Rate: ₹90, Gear Price: ₹3500) ---');
  // Height = 144 / 12 = 12.00 ft
  // Width = 120 / 12 = 10.00 ft
  // Gear Over Height = 12.00 + 2.00 = 14.00 ft
  // Gear Over Width = 10.00 + 0.75 = 10.75 ft
  // Total SqFt = 14.00 * 10.75 = 150.50 sq.ft
  // Cover Size = 10.75 + 0.75 = 11.50 ft
  // Shutter Basic = (150.50 * 260) + 3500 = 39130 + 3500 = ₹42,630.00
  // GI Cover Basic = 11.50 * 90 = ₹1,035.00
  // Basic Total = 42630 + 1035 = ₹43,665.00
  const gearResult = calculateShutterItem({
    height_inches: 144,
    width_inches: 120,
    shutter_type: 'Gear',
    fitting_type: 'B Type',
    rate_per_sqft: 260,
    gi_top_cover_rate_per_sqft: 90,
    gear_price: 3500
  });

  assertEqual(gearResult.heightFt, 12, 'Gear Height Ft');
  assertEqual(gearResult.widthFt, 10, 'Gear Width Ft');
  assertEqual(gearResult.overHeight, 14.00, 'Gear Over Height');
  assertEqual(gearResult.overWidth, 10.75, 'Gear Over Width');
  assertEqual(gearResult.coverSize, 11.50, 'Gear Cover Size');
  assertEqual(gearResult.totalSqft, 150.50, 'Gear Total SqFt');
  assertEqual(gearResult.shutterBasic, 42630.00, 'Gear Shutter Basic');
  assertEqual(gearResult.giTopCoverBasic, 1035.00, 'Gear GI Cover Basic');
  assertEqual(gearResult.basicTotal, 43665.00, 'Gear Basic Total');
  console.log('');

  // TEST 3: MOTORISED SHUTTER (180" x 144")
  console.log('--- TEST 3: MOTORISED SHUTTER (180" x 144", Rate: ₹280, GI Cover Rate: ₹100, Motor Price: ₹18000) ---');
  // Height = 180 / 12 = 15.00 ft
  // Width = 144 / 12 = 12.00 ft
  // Motorised Over Height = 15.00 + 2.00 = 17.00 ft
  // Motorised Over Width = 12.00 + 0.75 = 12.75 ft
  // Total SqFt = 17.00 * 12.75 = 216.75 sq.ft
  // Cover Size = 12.75 + 0.75 = 13.50 ft
  // Shutter Basic = (216.75 * 280) + 18000 = 60690 + 18000 = ₹78,690.00
  // GI Cover Basic = 13.50 * 100 = ₹1,350.00
  // Basic Total = 78690 + 1350 = ₹80,040.00
  const motorResult = calculateShutterItem({
    height_inches: 180,
    width_inches: 144,
    shutter_type: 'Motorised',
    fitting_type: 'A Type',
    rate_per_sqft: 280,
    gi_top_cover_rate_per_sqft: 100,
    motor_price: 18000
  });

  assertEqual(motorResult.heightFt, 15, 'Motorised Height Ft');
  assertEqual(motorResult.widthFt, 12, 'Motorised Width Ft');
  assertEqual(motorResult.overHeight, 17.00, 'Motorised Over Height');
  assertEqual(motorResult.overWidth, 12.75, 'Motorised Over Width');
  assertEqual(motorResult.coverSize, 13.50, 'Motorised Cover Size');
  assertEqual(motorResult.totalSqft, 216.75, 'Motorised Total SqFt');
  assertEqual(motorResult.shutterBasic, 78690.00, 'Motorised Shutter Basic');
  assertEqual(motorResult.giTopCoverBasic, 1350.00, 'Motorised GI Cover Basic');
  assertEqual(motorResult.basicTotal, 80040.00, 'Motorised Basic Total');
  console.log('');

  // TEST 4: FINANCIAL SUMMARY WITH GST YES & TRANSPORTATION
  console.log('--- TEST 4: FINANCIAL SUMMARY WITH GST YES (18%) & TRANSPORTATION ---');
  // Manual shutter basic total = 25157.50
  // Transportation = 2000.00
  // Additional Charges = 1500.00
  // Discount = 500.00
  // Total Basic = 25157.50 + 2000 + 1500 - 500 = 28157.50
  // GST Amount (18% of 28157.50) = 5068.35
  // Final Total = 28157.50 + 5068.35 = 33225.85
  const summaryGstYes = calculateQuotationSummary({
    items: [manualResult],
    transportation: 2000,
    additionalCharges: [{ description: 'Extra chain', amount: 1500 }],
    discountAmount: 500,
    gstApplicable: true,
    gstPercent: 18
  });

  assertEqual(summaryGstYes.totalBasic, 28157.50, 'GST Yes Total Basic (Includes Transportation)');
  assertEqual(summaryGstYes.gstAmount, 5068.35, 'GST Yes GST Amount (18%)');
  assertEqual(summaryGstYes.finalTotal, 33225.85, 'GST Yes Final Total');
  console.log('');

  // TEST 5: FINANCIAL SUMMARY WITH GST NO
  console.log('--- TEST 5: FINANCIAL SUMMARY WITH GST NO & TRANSPORTATION ---');
  // Total Basic = 28157.50
  // GST Amount = 0.00
  // Final Total = 28157.50
  const summaryGstNo = calculateQuotationSummary({
    items: [manualResult],
    transportation: 2000,
    additionalCharges: [{ description: 'Extra chain', amount: 1500 }],
    discountAmount: 500,
    gstApplicable: false
  });

  assertEqual(summaryGstNo.totalBasic, 28157.50, 'GST No Total Basic');
  assertEqual(summaryGstNo.gstAmount, 0.00, 'GST No GST Amount');
  assertEqual(summaryGstNo.finalTotal, 28157.50, 'GST No Final Total');
  console.log('');

  console.log('================================================================');
  console.log(`  SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase4Tests();
