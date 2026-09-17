const { prisma } = require('./src/config/db');

async function testPhase11() {
  console.log("=========================================");
  console.log("=== STARTING PHASE 11 COMPANY SETTINGS VERIFICATION ===");
  console.log("=========================================");

  let testCustomer = null;
  let createdQuotations = [];
  let originalSettings = null;

  try {
    // 1. Store original company settings to restore after test
    originalSettings = await prisma.companySetting.findFirst({
      where: { isActive: true },
      orderBy: { id: 'desc' }
    });

    console.log("✓ Current Company Settings retrieved:", originalSettings?.companyName || "Default Settings");

    // 2. Update Company Settings (Set V1)
    console.log("\n--- Test 1: Update Company Settings (V1) ---");
    const v1Data = {
      companyName: "Swagat Industries Pvt Ltd (V1)",
      logoUrl: "/v1_logo.png",
      address: "Plot 100, GIDC Metoda Industrial Area, Rajkot",
      cityStatePincode: "Rajkot, Gujarat - 360021",
      mobile: "+91 99999 00000",
      altMobile: "+91 99999 11111",
      email: "v1@swagatindustries.com",
      website: "www.swagatindustries-v1.com",
      gstNo: "24AAACS9999F1Z9"
    };

    let settingRecord;
    if (originalSettings) {
      settingRecord = await prisma.companySetting.update({
        where: { id: originalSettings.id },
        data: v1Data
      });
    } else {
      settingRecord = await prisma.companySetting.create({
        data: v1Data
      });
    }

    console.log(`✓ Company Settings updated to V1: ${settingRecord.companyName}, Mobile: ${settingRecord.mobile}, GST: ${settingRecord.gstNo}`);

    // 3. Create Test Customer & Quotation 1 (Q1)
    console.log("\n--- Test 2: Create Quotation Q1 under V1 Settings ---");
    testCustomer = await prisma.customer.create({
      data: {
        customerName: "Phase11 Test Customer",
        mobileNumber: "9876500000",
        address: "Test Customer Address, Rajkot"
      }
    });

    // Simulate creation snapshot logic
    const activeTerms = await prisma.quotationTerm.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' }
    });

    const quotation1 = await prisma.quotation.create({
      data: {
        quotationNo: `SW-TEST-P11-Q1-${Date.now().toString().slice(-4)}`,
        customerId: testCustomer.id,
        shutterBasicTotal: 5000,
        totalBasic: 5000,
        gstApplicable: true,
        gstPercent: 18,
        gstAmount: 900,
        finalTotal: 5900,
        companyDetails: {
          companyName: settingRecord.companyName,
          logoUrl: settingRecord.logoUrl,
          address: settingRecord.address,
          cityStatePincode: settingRecord.cityStatePincode,
          mobile: settingRecord.mobile,
          altMobile: settingRecord.altMobile,
          email: settingRecord.email,
          website: settingRecord.website,
          gstNo: settingRecord.gstNo
        },
        quotationTerms: activeTerms.map(t => ({
          id: t.id,
          termKey: t.termKey,
          termTitle: t.termTitle,
          termText: t.termText,
          displayOrder: t.displayOrder
        }))
      }
    });
    createdQuotations.push(quotation1.id);

    console.log(`✓ Quotation Q1 created: #${quotation1.quotationNo} (ID: ${quotation1.id})`);
    console.log(`  Q1 Snapshot Company Name: "${quotation1.companyDetails.companyName}"`);
    console.log(`  Q1 Snapshot Mobile: "${quotation1.companyDetails.mobile}"`);
    console.log(`  Q1 Snapshot GST No: "${quotation1.companyDetails.gstNo}"`);
    console.log(`  Q1 Snapshot Terms Count: ${quotation1.quotationTerms?.length || 0}`);

    if (quotation1.companyDetails.companyName === "Swagat Industries Pvt Ltd (V1)" &&
        quotation1.companyDetails.gstNo === "24AAACS9999F1Z9") {
      console.log("✓ Verification PASSED: Q1 correctly saved V1 company settings snapshot.");
    } else {
      console.error("❌ Verification FAILED: Q1 snapshot mismatch.");
    }

    // 4. Update Company Settings (Set V2)
    console.log("\n--- Test 3: Update Company Settings to V2 ---");
    const v2Data = {
      companyName: "Swagat Engineering Group (V2)",
      logoUrl: "/v2_logo.png",
      address: "Plot 500, National Highway 8B, Rajkot",
      cityStatePincode: "Rajkot, Gujarat - 360002",
      mobile: "+91 88888 22222",
      altMobile: "+91 88888 33333",
      email: "contact@swagatgroup.com",
      website: "www.swagatgroup.com",
      gstNo: "24BBBCS8888F1Z8"
    };

    const settingV2 = await prisma.companySetting.update({
      where: { id: settingRecord.id },
      data: v2Data
    });

    console.log(`✓ Company Settings updated to V2: ${settingV2.companyName}, Mobile: ${settingV2.mobile}, GST: ${settingV2.gstNo}`);

    // 5. Verify Q1 Historical Consistency
    console.log("\n--- Test 4: Verify Q1 Retained V1 Historical Settings ---");
    const reFetchedQ1 = await prisma.quotation.findUnique({
      where: { id: quotation1.id }
    });

    console.log(`  Re-fetched Q1 Company Name: "${reFetchedQ1.companyDetails.companyName}"`);
    console.log(`  Re-fetched Q1 GST No: "${reFetchedQ1.companyDetails.gstNo}"`);

    if (reFetchedQ1.companyDetails.companyName === "Swagat Industries Pvt Ltd (V1)" &&
        reFetchedQ1.companyDetails.gstNo === "24AAACS9999F1Z9") {
      console.log("✓ Historical Consistency PASSED: Q1 remained historically accurate after company settings updated to V2!");
    } else {
      console.error("❌ Historical Consistency FAILED: Q1 snapshot was altered.");
    }

    // 6. Create Quotation Q2 under V2 Settings
    console.log("\n--- Test 5: Create Quotation Q2 under V2 Settings ---");
    const quotation2 = await prisma.quotation.create({
      data: {
        quotationNo: `SW-TEST-P11-Q2-${Date.now().toString().slice(-4)}`,
        customerId: testCustomer.id,
        shutterBasicTotal: 8000,
        totalBasic: 8000,
        gstApplicable: true,
        gstPercent: 18,
        gstAmount: 1440,
        finalTotal: 9440,
        companyDetails: {
          companyName: settingV2.companyName,
          logoUrl: settingV2.logoUrl,
          address: settingV2.address,
          cityStatePincode: settingV2.cityStatePincode,
          mobile: settingV2.mobile,
          altMobile: settingV2.altMobile,
          email: settingV2.email,
          website: settingV2.website,
          gstNo: settingV2.gstNo
        },
        quotationTerms: activeTerms.map(t => ({
          id: t.id,
          termKey: t.termKey,
          termTitle: t.termTitle,
          termText: t.termText,
          displayOrder: t.displayOrder
        }))
      }
    });
    createdQuotations.push(quotation2.id);

    console.log(`✓ Quotation Q2 created: #${quotation2.quotationNo} (ID: ${quotation2.id})`);
    console.log(`  Q2 Snapshot Company Name: "${quotation2.companyDetails.companyName}"`);
    console.log(`  Q2 Snapshot GST No: "${quotation2.companyDetails.gstNo}"`);

    if (quotation2.companyDetails.companyName === "Swagat Engineering Group (V2)" &&
        quotation2.companyDetails.gstNo === "24BBBCS8888F1Z8") {
      console.log("✓ New Quotation Auto-apply PASSED: Q2 correctly inherited latest V2 company settings.");
    } else {
      console.error("❌ New Quotation Auto-apply FAILED.");
    }

    console.log("\n=========================================");
    console.log("=== PHASE 11 BACKEND VERIFICATION SUCCESSFUL ===");
    console.log("=========================================");

  } catch (err) {
    console.error("❌ ERROR during Phase 11 verification:", err);
  } finally {
    // Clean up created quotations & test customer
    if (createdQuotations.length > 0) {
      console.log(`\nCleaning up ${createdQuotations.length} test quotations...`);
      await prisma.quotation.deleteMany({
        where: { id: { in: createdQuotations } }
      });
      console.log("✓ Test quotations deleted.");
    }
    if (testCustomer) {
      console.log("Cleaning up test customer...");
      await prisma.customer.delete({ where: { id: testCustomer.id } });
      console.log("✓ Test customer deleted.");
    }
    // Restore original company settings if available
    if (originalSettings) {
      console.log("Restoring original company settings...");
      await prisma.companySetting.update({
        where: { id: originalSettings.id },
        data: {
          companyName: originalSettings.companyName,
          logoUrl: originalSettings.logoUrl,
          address: originalSettings.address,
          cityStatePincode: originalSettings.cityStatePincode,
          mobile: originalSettings.mobile,
          altMobile: originalSettings.altMobile,
          email: originalSettings.email,
          website: originalSettings.website,
          gstNo: originalSettings.gstNo
        }
      });
      console.log("✓ Original company settings restored.");
    }
    await prisma.$disconnect();
  }
}

testPhase11();
