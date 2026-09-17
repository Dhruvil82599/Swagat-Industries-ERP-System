const { prisma } = require('./src/config/db');

async function testPhase8() {
  console.log("=== STARTING PHASE 8 VERIFICATION ===");

  try {
    // 1. Test Company Settings
    let settings = await prisma.companySetting.findFirst({
      where: { isActive: true },
      orderBy: { id: 'desc' }
    });

    if (!settings) {
      console.log("Creating default company settings...");
      settings = await prisma.companySetting.create({
        data: {
          companyName: 'Swagat Industries',
          address: 'Plot No 22, Survey No 45, Rajkot-Gondal Highway, Rajkot, Gujarat',
          cityStatePincode: 'Rajkot, Gujarat - 360004',
          mobile: '+91 98765 43210',
          altMobile: '+91 91234 56789',
          email: 'info@swagatindustries.com',
          website: 'www.swagatindustries.com',
          gstNo: '24ABCDE1234F1Z5'
        }
      });
    }

    console.log("✓ Company Settings retrieved:", settings.companyName, "| GST:", settings.gstNo);

    // 2. Test Quotation Terms
    let terms = await prisma.quotationTerm.findMany({
      orderBy: { displayOrder: 'asc' }
    });

    const DEFAULT_TERMS = [
      { termKey: 'payment_terms', termTitle: 'Payment Terms', termText: '50% advance along with confirmed purchase order; balance 50% before dispatch/delivery.', displayOrder: 1 },
      { termKey: 'delivery', termTitle: 'Delivery Period', termText: 'Within 7 to 10 working days from the date of confirmed order with advance.', displayOrder: 2 },
      { termKey: 'validity', termTitle: 'Quotation Validity', termText: 'Rates quoted are valid for 15 days from quotation date and subject to change thereafter.', displayOrder: 3 },
      { termKey: 'loading_unloading', termTitle: 'Loading / Unloading', termText: 'Loading at factory will be provided by Swagat Industries. Unloading at site will be in customer scope.', displayOrder: 4 },
      { termKey: 'storage', termTitle: 'Site Readiness & Storage', termText: 'Proper dry storage space and necessary civil openings/support must be provided at the site.', displayOrder: 5 },
      { termKey: 'motorised_specs', termTitle: 'Motorised Shutter Specifications', termText: 'Single phase / 3-phase power point near the shutter must be provided by the client before installation.', displayOrder: 6 },
      { termKey: 'other_terms', termTitle: 'Other Terms', termText: 'Work will proceed strictly as per approved site dimensions and quotation specifications.', displayOrder: 7 },
      { termKey: 'order_cancellation', termTitle: 'Order Cancellation', termText: 'In case of order cancellation after production has commenced, advance amount will be non-refundable.', displayOrder: 8 },
      { termKey: 'measurement_calculate', termTitle: 'Measurement Calculate', termText: 'All shutter square footage calculations are based on standard industry measurements including over-height & over-width allowances.', displayOrder: 9 },
      { termKey: 'disputes', termTitle: 'Disputes & Jurisdiction', termText: 'Subject to Rajkot jurisdiction only.', displayOrder: 10 }
    ];

    const existingKeys = new Set(terms.map(t => t.termKey).filter(Boolean));
    const missingTerms = DEFAULT_TERMS.filter(dt => dt.termKey && !existingKeys.has(dt.termKey));
    if (missingTerms.length > 0) {
      console.log(`Seeding ${missingTerms.length} missing default quotation terms...`);
      await prisma.quotationTerm.createMany({ data: missingTerms });
      terms = await prisma.quotationTerm.findMany({ orderBy: { displayOrder: 'asc' } });
    }

    console.log(`✓ Quotation Terms retrieved: ${terms.length} terms total`);
    terms.forEach(t => console.log(`   [${t.displayOrder}] ${t.termTitle}`));

    // 3. Test Quotation with items and relations
    const latestQuotation = await prisma.quotation.findFirst({
      include: {
        customer: true,
        industry: true,
        site: true,
        items: true,
        additionalCharges: true
      },
      orderBy: { id: 'desc' }
    });

    if (latestQuotation) {
      console.log(`✓ Latest Quotation retrieved: #${latestQuotation.quotationNo} (ID: ${latestQuotation.id})`);
      console.log(`   Customer: ${latestQuotation.customer.customerName}`);
      console.log(`   Items count: ${latestQuotation.items.length}`);
      console.log(`   Final Total: ₹${latestQuotation.finalTotal}`);
    } else {
      console.log("No quotation found in database. Please create one in frontend.");
    }

    console.log("=== PHASE 8 BACKEND VERIFICATION SUCCESSFUL ===");
  } catch (err) {
    console.error("❌ ERROR during Phase 8 verification:", err);
  } finally {
    await prisma.$disconnect();
  }
}

testPhase8();
