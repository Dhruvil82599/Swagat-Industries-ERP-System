const { prisma } = require('./src/config/db');
const { generateQuotationNumber } = require('./src/utils/quotationNumber');
const { calculateQuotationSummary } = require('./src/utils/calculator');

async function runPhase6Tests() {
  console.log('================================================================');
  console.log('   SWAGAT INDUSTRIES ERP — PHASE 6 EDITING & SEARCH TESTS       ');
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

  let createdQuotationId = null;
  let createdQuotationNo = null;

  try {
    // 1. SETUP: Create Customer, Industry, Site for test
    const customer = await prisma.customer.create({
      data: {
        customerName: 'Phase 6 Test Customer',
        mobileNumber: '9988776655',
        address: 'Phase 6 Test Address',
        gstNo: '24PHASE6GST123'
      }
    });

    const industry = await prisma.industry.create({
      data: {
        customerId: customer.id,
        industryName: 'Phase 6 Test Industry',
        address: 'Phase 6 Industry Plot'
      }
    });

    const site = await prisma.site.create({
      data: {
        industryId: industry.id,
        siteName: 'Phase 6 Site Unit',
        siteAddress: 'Phase 6 Site Address',
        cityLocation: 'Rajkot'
      }
    });

    // 2. CREATE QUOTATION
    console.log('--- TEST 1: CREATE INITIAL QUOTATION ---');
    const today = new Date();
    const qNo = await generateQuotationNumber(today);
    createdQuotationNo = qNo;

    const initialSummary = calculateQuotationSummary({
      items: [
        {
          shutter_name_no: 'Phase6 Shutter 1',
          height_inches: 120, // 10ft -> over 11.5
          width_inches: 96,   // 8ft -> over 8.5 -> total sqft 97.75
          shutter_type: 'Manual',
          fitting_type: 'A Type',
          rate_per_sqft: 200, // 19550
          gi_top_cover_rate_per_sqft: 50 // 9 * 50 = 450 -> Basic: 20000
        }
      ],
      transportation: 1000,
      discountAmount: 0,
      gstApplicable: true,
      gstPercent: 18.00
    });

    const created = await prisma.$transaction(async (tx) => {
      const q = await tx.quotation.create({
        data: {
          quotationNo: qNo,
          quotationDate: today,
          customerId: customer.id,
          industryId: industry.id,
          siteId: site.id,
          shutterBasicTotal: initialSummary.shutterBasicTotal,
          giTopCoverTotal: initialSummary.giTopCoverTotal,
          transportationCharges: initialSummary.transportationCharges,
          totalBasic: initialSummary.totalBasic,
          gstApplicable: true,
          gstPercent: 18.00,
          gstAmount: initialSummary.gstAmount,
          finalTotal: initialSummary.finalTotal
        }
      });

      for (const item of initialSummary.processedItems) {
        await tx.quotationItem.create({
          data: {
            quotationId: q.id,
            srNo: 1,
            shutterNameNo: item.shutter_name_no,
            heightInches: item.heightInches,
            widthInches: item.widthInches,
            heightFt: item.heightFt,
            widthFt: item.widthFt,
            shutterType: item.shutterType,
            fittingType: item.fittingType,
            overHeight: item.overHeight,
            overWidth: item.overWidth,
            totalSqft: item.totalSqft,
            coverSize: item.coverSize,
            ratePerSqft: item.ratePerSqft,
            giTopCoverRatePerSqft: item.giTopCoverRatePerSqft,
            shutterBasic: item.shutterBasic,
            giTopCoverBasic: item.giTopCoverBasic,
            basicTotal: item.basicTotal
          }
        });
      }
      return q;
    });

    createdQuotationId = created.id;
    console.log(`Created Quotation ID: ${createdQuotationId} with No: ${createdQuotationNo}`);
    assertEqual(created.quotationNo, qNo, 'Quotation Number Created');
    console.log('');

    // 3. SEARCH TESTS
    console.log('--- TEST 2: QUOTATION SEARCH (Customer Name, Mobile, Industry, Quotation No, Date) ---');
    const searchByName = await prisma.quotation.findMany({
      where: {
        OR: [
          { quotationNo: { contains: 'Phase 6', mode: 'insensitive' } },
          { customer: { customerName: { contains: 'Phase 6 Test Customer', mode: 'insensitive' } } }
        ]
      },
      include: { customer: true, industry: true }
    });
    assertEqual(searchByName.length >= 1, true, 'Search by Customer Name');

    const searchByMobile = await prisma.quotation.findMany({
      where: { customer: { mobileNumber: { contains: '9988776655' } } }
    });
    assertEqual(searchByMobile.length >= 1, true, 'Search by Mobile Number');

    const searchByQNo = await prisma.quotation.findMany({
      where: { quotationNo: qNo }
    });
    assertEqual(searchByQNo.length, 1, 'Search by Quotation Number');

    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const searchByDate = await prisma.quotation.findMany({
      where: {
        quotationDate: {
          gte: new Date(dateStr + 'T00:00:00.000Z'),
          lte: new Date(dateStr + 'T23:59:59.999Z')
        }
      }
    });
    assertEqual(searchByDate.length >= 1, true, 'Search by Date (YYYY-MM-DD)');
    console.log('');

    // 4. EDIT & RECALCULATE TEST
    console.log('--- TEST 3: EDIT QUOTATION & VERIFY UNCHANGED QUOTATION NO ---');
    // Edit item rate to 250, transportation to 2000, discount to 500
    const editSummary = calculateQuotationSummary({
      items: [
        {
          shutter_name_no: 'Phase6 Shutter 1 (Edited)',
          height_inches: 120,
          width_inches: 96,
          shutter_type: 'Manual',
          fitting_type: 'A Type',
          rate_per_sqft: 250, // 24437.50
          gi_top_cover_rate_per_sqft: 80 // 720.00 -> Basic: 25157.50
        }
      ],
      transportation: 2000,
      discountAmount: 500,
      gstApplicable: true,
      gstPercent: 18.00
    });

    // Update quotation in transaction (In-place replace items & totals)
    await prisma.$transaction(async (tx) => {
      await tx.quotationItem.deleteMany({ where: { quotationId: createdQuotationId } });
      for (const item of editSummary.processedItems) {
        await tx.quotationItem.create({
          data: {
            quotationId: createdQuotationId,
            srNo: 1,
            shutterNameNo: item.shutter_name_no,
            heightInches: item.heightInches,
            widthInches: item.widthInches,
            heightFt: item.heightFt,
            widthFt: item.widthFt,
            shutterType: item.shutterType,
            fittingType: item.fittingType,
            overHeight: item.overHeight,
            overWidth: item.overWidth,
            totalSqft: item.totalSqft,
            coverSize: item.coverSize,
            ratePerSqft: item.ratePerSqft,
            giTopCoverRatePerSqft: item.giTopCoverRatePerSqft,
            shutterBasic: item.shutterBasic,
            giTopCoverBasic: item.giTopCoverBasic,
            basicTotal: item.basicTotal
          }
        });
      }

      await tx.quotation.update({
        where: { id: createdQuotationId },
        data: {
          shutterBasicTotal: editSummary.shutterBasicTotal,
          giTopCoverTotal: editSummary.giTopCoverTotal,
          transportationCharges: editSummary.transportationCharges,
          discountAmount: editSummary.discountAmount,
          totalBasic: editSummary.totalBasic,
          gstAmount: editSummary.gstAmount,
          finalTotal: editSummary.finalTotal
        }
      });
    });

    // 5. REOPEN AND VERIFY UPDATED VALUES
    console.log('--- TEST 4: REOPEN EDITED QUOTATION AND VERIFY ---');
    const reopened = await prisma.quotation.findUnique({
      where: { id: createdQuotationId },
      include: { items: true }
    });

    assertEqual(reopened.quotationNo, qNo, 'Quotation No. Unchanged After Edit');
    assertEqual(Number(reopened.transportationCharges), 2000, 'Updated Transportation');
    assertEqual(Number(reopened.discountAmount), 500, 'Updated Discount');
    assertEqual(Number(reopened.items[0].ratePerSqft), 250, 'Updated Shutter Rate');
    assertEqual(Number(reopened.totalBasic), 26657.50, 'Recalculated Total Basic');
    assertEqual(Number(reopened.finalTotal), 31455.85, 'Recalculated Final Total (With GST)');
    console.log('');

    // CLEANUP
    console.log('--- CLEANING UP TEST DATA ---');
    await prisma.quotation.delete({ where: { id: createdQuotationId } });
    await prisma.site.delete({ where: { id: site.id } });
    await prisma.industry.delete({ where: { id: industry.id } });
    await prisma.customer.delete({ where: { id: customer.id } });
    console.log('✔ Cleaned up test database records successfully.\n');

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

runPhase6Tests();
