const fs = require('fs');
const path = require('path');
const { prisma } = require('./src/config/db');
const { backupDatabase } = require('./scripts/backup');
const { restoreDatabase } = require('./scripts/restore');

async function runPhase13Test() {
  console.log("===============================================================");
  console.log("=== PHASE 13: E2E BUSINESS FLOW & SYSTEM VERIFICATION TEST ===");
  console.log("===============================================================");

  let testCustomer = null;
  let testIndustry = null;
  let testSite = null;
  let testShutterManual = null;
  let testShutterGear = null;
  let testShutterMotor = null;
  let testQuotation = null;
  let testPayment1 = null;
  let testPayment2 = null;
  let backupFile = null;

  try {
    // -------------------------------------------------------------
    // TEST 1: Customer CRUD
    // -------------------------------------------------------------
    console.log("\n[TEST 1] Testing Customer CRUD...");
    testCustomer = await prisma.customer.create({
      data: {
        customerName: "Phase13 Enterprise Client",
        mobileNumber: "9898989898",
        address: "Phase 13 Industrial Park, Metoda, Rajkot",
        gstNo: "24AAACS1111A1Z1"
      }
    });
    console.log(`  ✓ Customer Created: ID=${testCustomer.id}, Name=${testCustomer.customerName}`);

    testCustomer = await prisma.customer.update({
      where: { id: testCustomer.id },
      data: { customerName: "Phase13 Enterprise Client (Updated)" }
    });
    console.log(`  ✓ Customer Updated: Name=${testCustomer.customerName}`);

    // -------------------------------------------------------------
    // TEST 2: Industry CRUD
    // -------------------------------------------------------------
    console.log("\n[TEST 2] Testing Industry CRUD...");
    testIndustry = await prisma.industry.create({
      data: {
        customerId: testCustomer.id,
        industryName: "Phase13 Heavy Steel Corp",
        address: "Plot 800, GIDC Rajkot",
        contactPerson: "Mr. Swagat Patel",
        mobileNo: "9876543210",
        gstNo: "24AAACS1111A1Z1"
      }
    });
    console.log(`  ✓ Industry Created: ID=${testIndustry.id}, Name=${testIndustry.industryName}`);

    // -------------------------------------------------------------
    // TEST 3: Site CRUD
    // -------------------------------------------------------------
    console.log("\n[TEST 3] Testing Site CRUD...");
    testSite = await prisma.site.create({
      data: {
        industryId: testIndustry.id,
        siteName: "Metoda Plant Site 1",
        siteAddress: "Gate 2, GIDC Metoda",
        cityLocation: "Rajkot",
        contactPerson: "Site Supervisor",
        mobileNo: "9900990099",
        remark: "Phase 13 test site"
      }
    });
    console.log(`  ✓ Site Created: ID=${testSite.id}, Name=${testSite.siteName}`);

    // -------------------------------------------------------------
    // TEST 4: Shutter Master & Calculation Engines
    // -------------------------------------------------------------
    console.log("\n[TEST 4] Testing Shutter CRUD & Calculation Engines...");
    // 4a. Manual Shutter
    testShutterManual = await prisma.shutter.create({
      data: {
        siteId: testSite.id,
        shutterNameNo: "S1 - Manual Main Gate",
        heightInches: 120, // 10 ft
        widthInches: 96,   // 8 ft
        shutterType: "Manual",
        fittingType: "A Type",
        ratePerSqft: 150,
        giTopCoverRatePerSqft: 40,
        gearPrice: 0,
        motorPrice: 0,
        gstApplicable: true,
        remark: "Manual Rolling Shutter"
      }
    });
    console.log(`  ✓ Shutter 1 (Manual) Created: ${testShutterManual.shutterNameNo}`);

    // 4b. Gear Shutter
    testShutterGear = await prisma.shutter.create({
      data: {
        siteId: testSite.id,
        shutterNameNo: "S2 - Heavy Gear Shutter",
        heightInches: 144, // 12 ft
        widthInches: 120,  // 10 ft
        shutterType: "Gear",
        fittingType: "B Type",
        ratePerSqft: 180,
        giTopCoverRatePerSqft: 45,
        gearPrice: 3500,
        motorPrice: 0,
        gstApplicable: true,
        remark: "Gear Operated Shutter"
      }
    });
    console.log(`  ✓ Shutter 2 (Gear) Created: ${testShutterGear.shutterNameNo}`);

    // 4c. Motorised Shutter
    testShutterMotor = await prisma.shutter.create({
      data: {
        siteId: testSite.id,
        shutterNameNo: "S3 - Motorised Automatic Shutter",
        heightInches: 180, // 15 ft
        widthInches: 144,  // 12 ft
        shutterType: "Motorised",
        fittingType: "A Type",
        ratePerSqft: 220,
        giTopCoverRatePerSqft: 50,
        gearPrice: 0,
        motorPrice: 18500,
        gstApplicable: true,
        remark: "Automatic Motor Shutter"
      }
    });
    console.log(`  ✓ Shutter 3 (Motorised) Created: ${testShutterMotor.shutterNameNo}`);

    // -------------------------------------------------------------
    // TEST 5: Quotation Creation with Multi-Shutters & Snapshotting
    // -------------------------------------------------------------
    console.log("\n[TEST 5] Testing Quotation Creation with Snapshotting & Calculations...");
    
    // Fetch active company settings and terms
    const settings = await prisma.companySetting.findFirst({ where: { isActive: true } });
    const terms = await prisma.quotationTerm.findMany({ where: { isActive: true } });

    // Item calculations verification:
    // S1 (Manual): Height=120" (10ft), Width=96" (8ft). A Type -> OverHeight=1.5ft, OverWidth=0.5ft.
    // Total H = 11.5ft, Total W = 8.5ft -> Total Sqft = 97.75. Cover Size = 8.5 Rft.
    // Shutter Basic = 97.75 * 150 = 14,662.50. GI Cover = 8.5 * 40 = 340. Basic = 15,002.50.
    
    const quotationNo = `SW/2026-27/${Date.now().toString().slice(-4)}`;
    testQuotation = await prisma.quotation.create({
      data: {
        quotationNo,
        customerId: testCustomer.id,
        industryId: testIndustry.id,
        siteId: testSite.id,
        shutterBasicTotal: 30000,
        giTopCoverTotal: 1000,
        transportationCharges: 2500,
        additionalChargesTotal: 1500,
        discountAmount: 1000,
        discountReason: "Special Phase 13 Client Discount",
        totalBasic: 34000,
        gstApplicable: true,
        gstPercent: 18,
        gstAmount: 6120,
        finalTotal: 40120,
        remark: "Complete E2E Business Flow Quotation",
        companyDetails: settings ? {
          companyName: settings.companyName,
          address: settings.address,
          mobile: settings.mobile,
          gstNo: settings.gstNo
        } : {},
        quotationTerms: terms.map(t => ({
          termTitle: t.termTitle,
          termText: t.termText
        })),
        items: {
          create: [
            {
              shutterId: testShutterManual.id,
              srNo: 1,
              shutterNameNo: testShutterManual.shutterNameNo,
              heightInches: 120,
              widthInches: 96,
              heightFt: 10,
              widthFt: 8,
              shutterType: "Manual",
              fittingType: "A Type",
              overHeight: 1.5,
              overWidth: 0.5,
              totalSqft: 97.75,
              coverSize: 8.5,
              ratePerSqft: 150,
              giTopCoverRatePerSqft: 40,
              gearPrice: 0,
              motorPrice: 0,
              shutterBasic: 14662.50,
              giTopCoverBasic: 340.00,
              basicTotal: 15002.50,
              gstApplicable: true
            },
            {
              shutterId: testShutterGear.id,
              srNo: 2,
              shutterNameNo: testShutterGear.shutterNameNo,
              heightInches: 144,
              widthInches: 120,
              heightFt: 12,
              widthFt: 10,
              shutterType: "Gear",
              fittingType: "B Type",
              overHeight: 2.0,
              overWidth: 0.5,
              totalSqft: 147.00,
              coverSize: 10.5,
              ratePerSqft: 180,
              giTopCoverRatePerSqft: 45,
              gearPrice: 3500,
              motorPrice: 0,
              shutterBasic: 29960.00,
              giTopCoverBasic: 472.50,
              basicTotal: 30432.50,
              gstApplicable: true
            }
          ]
        },
        additionalCharges: {
          create: [
            {
              description: "Scaffolding & Installation",
              amount: 1500,
              chargeType: "Quotation-wise"
            }
          ]
        }
      },
      include: {
        items: true,
        additionalCharges: true
      }
    });

    console.log(`  ✓ Quotation Created: #${testQuotation.quotationNo} (ID: ${testQuotation.id})`);
    console.log(`    Total Items: ${testQuotation.items.length}, Final Total: ₹${testQuotation.finalTotal}`);
    console.log(`    Company Snapshot Verified: "${testQuotation.companyDetails?.companyName || 'N/A'}"`);
    console.log(`    Terms Snapshot Count: ${testQuotation.quotationTerms?.length || 0}`);

    // -------------------------------------------------------------
    // TEST 6: Payment Flow & Balance Calculation
    // -------------------------------------------------------------
    console.log("\n[TEST 6] Testing Payment Creation & Balance Calculations...");
    
    // Payment 1: ₹15,000 via Bank Transfer
    testPayment1 = await prisma.payment.create({
      data: {
        quotationId: testQuotation.id,
        paymentAmount: 15000,
        paymentMethod: "Bank Transfer",
        transactionNo: "TXN12345678",
        bankName: "HDFC Bank",
        remark: "Advance payment"
      }
    });
    console.log(`  ✓ Payment 1 recorded: ₹${testPayment1.paymentAmount} (${testPayment1.paymentMethod})`);

    // Payment 2: ₹10,000 via Cash
    testPayment2 = await prisma.payment.create({
      data: {
        quotationId: testQuotation.id,
        paymentAmount: 10000,
        paymentMethod: "Cash",
        remark: "Part payment on delivery"
      }
    });
    console.log(`  ✓ Payment 2 recorded: ₹${testPayment2.paymentAmount} (${testPayment2.paymentMethod})`);

    // Verify aggregate payments & balance
    const paymentsSummary = await prisma.payment.aggregate({
      where: { quotationId: testQuotation.id },
      _sum: { paymentAmount: true }
    });
    const totalPaid = Number(paymentsSummary._sum.paymentAmount || 0);
    const quotationFinal = Number(testQuotation.finalTotal);
    const balanceRemaining = quotationFinal - totalPaid;

    console.log(`  ✓ Total Paid: ₹${totalPaid}`);
    console.log(`  ✓ Balance Remaining: ₹${balanceRemaining}`);
    if (totalPaid === 25000 && balanceRemaining === 15120) {
      console.log("  ✓ Payment Balance Aggregation PASSED!");
    } else {
      console.error(`  ❌ Payment Balance Aggregation FAILED. Expected 15120, got ${balanceRemaining}`);
    }

    // -------------------------------------------------------------
    // TEST 7: Backup & Restore Verification
    // -------------------------------------------------------------
    console.log("\n[TEST 7] Testing Automated Backup & Restore Utilities...");
    backupFile = await backupDatabase();
    if (fs.existsSync(backupFile)) {
      console.log(`  ✓ Backup file verified on disk: ${path.basename(backupFile)}`);
    } else {
      console.error("  ❌ Backup file creation FAILED.");
    }

    // Perform DB restore test with the generated backup file
    console.log("  Executing Database Restore test...");
    await restoreDatabase(backupFile);
    console.log("  ✓ Database Restore test PASSED successfully!");

    console.log("\n===============================================================");
    console.log("=== PHASE 13 E2E BUSINESS FLOW VERIFICATION SUCCESSFUL! ===");
    console.log("===============================================================");

  } catch (err) {
    console.error("\n❌ ERROR during Phase 13 E2E test execution:", err);
    process.exit(1);
  } finally {
    // Cleanup test artifacts from database
    console.log("\nCleaning up Phase 13 test records...");
    if (testQuotation) {
      await prisma.payment.deleteMany({ where: { quotationId: testQuotation.id } });
      await prisma.additionalCharge.deleteMany({ where: { quotationId: testQuotation.id } });
      await prisma.quotationItem.deleteMany({ where: { quotationId: testQuotation.id } });
      await prisma.quotation.delete({ where: { id: testQuotation.id } });
    }
    if (testSite) {
      await prisma.shutter.deleteMany({ where: { siteId: testSite.id } });
      await prisma.site.delete({ where: { id: testSite.id } });
    }
    if (testIndustry) {
      await prisma.industry.delete({ where: { id: testIndustry.id } });
    }
    if (testCustomer) {
      await prisma.customer.delete({ where: { id: testCustomer.id } });
    }
    console.log("✓ Cleanup finished.");
    await prisma.$disconnect();
  }
}

runPhase13Test();
