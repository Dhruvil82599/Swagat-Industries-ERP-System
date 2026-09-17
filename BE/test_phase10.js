const { prisma } = require('./src/config/db');

async function testPhase10() {
  console.log("=========================================");
  console.log("=== STARTING PHASE 10 DASHBOARD VERIFICATION ===");
  console.log("=========================================");

  try {
    const [
      totalCustomers,
      totalIndustries,
      totalSites,
      totalShutters,
      totalQuotations,
      quotationAgg,
      paymentAgg,
      recentQuotations
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.industry.count(),
      prisma.site.count(),
      prisma.shutter.count(),
      prisma.quotation.count(),
      prisma.quotation.aggregate({
        _sum: { finalTotal: true }
      }),
      prisma.payment.aggregate({
        _sum: { paymentAmount: true }
      }),
      prisma.quotation.findMany({
        take: 5,
        orderBy: [
          { quotationDate: 'desc' },
          { id: 'desc' }
        ],
        include: {
          customer: {
            select: {
              customerName: true
            }
          }
        }
      })
    ]);

    const totalQuotationAmount = Number(quotationAgg._sum.finalTotal || 0);
    const totalPaid = Number(paymentAgg._sum.paymentAmount || 0);
    const totalPending = Math.max(0, Number((totalQuotationAmount - totalPaid).toFixed(2)));

    console.log(`✓ Total Customers: ${totalCustomers}`);
    console.log(`✓ Total Industries / Companies: ${totalIndustries}`);
    console.log(`✓ Total Sites: ${totalSites}`);
    console.log(`✓ Total Shutters: ${totalShutters}`);
    console.log(`✓ Total Quotations: ${totalQuotations}`);
    console.log(`✓ Total Quotation Amount: ₹${totalQuotationAmount.toFixed(2)}`);
    console.log(`✓ Total Paid: ₹${totalPaid.toFixed(2)}`);
    console.log(`✓ Total Pending: ₹${totalPending.toFixed(2)}`);

    console.log(`\n--- Recent Quotations (Count: ${recentQuotations.length}) ---`);
    recentQuotations.forEach((q, idx) => {
      console.log(`  [${idx + 1}] Quotation No: ${q.quotationNo} | Customer: ${q.customer?.customerName || 'N/A'} | Date: ${q.quotationDate.toISOString().split('T')[0]} | Amount: ₹${Number(q.finalTotal).toFixed(2)}`);
    });

    console.log("\n=========================================");
    console.log("=== PHASE 10 BACKEND VERIFICATION SUCCESSFUL ===");
    console.log("=========================================");
  } catch (err) {
    console.error("❌ ERROR during Phase 10 verification:", err);
  } finally {
    await prisma.$disconnect();
  }
}

testPhase10();
