const fs = require('fs');
const path = require('path');
const { prisma } = require('../src/config/db');

async function backupDatabase() {
  console.log("=========================================");
  console.log("=== STARTING SWAGAT ERP DATABASE BACKUP ===");
  console.log("=========================================");

  try {
    const backupDir = path.join(__dirname, '..', '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `swagat_erp_backup_${timestamp}.json`;
    const backupFilePath = path.join(backupDir, backupFileName);
    const latestFilePath = path.join(backupDir, 'latest_backup.json');

    console.log("Exporting database tables via Prisma...");

    const users = await prisma.user.findMany();
    const companySettings = await prisma.companySetting.findMany();
    const quotationTerms = await prisma.quotationTerm.findMany();
    const customers = await prisma.customer.findMany();
    const industries = await prisma.industry.findMany();
    const sites = await prisma.site.findMany();
    const shutters = await prisma.shutter.findMany();
    const quotations = await prisma.quotation.findMany();
    const quotationItems = await prisma.quotationItem.findMany();
    const additionalCharges = await prisma.additionalCharge.findMany();
    const payments = await prisma.payment.findMany();

    const backupData = {
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        counts: {
          users: users.length,
          companySettings: companySettings.length,
          quotationTerms: quotationTerms.length,
          customers: customers.length,
          industries: industries.length,
          sites: sites.length,
          shutters: shutters.length,
          quotations: quotations.length,
          quotationItems: quotationItems.length,
          additionalCharges: additionalCharges.length,
          payments: payments.length
        }
      },
      data: {
        users,
        companySettings,
        quotationTerms,
        customers,
        industries,
        sites,
        shutters,
        quotations,
        quotationItems,
        additionalCharges,
        payments
      }
    };

    const jsonContent = JSON.stringify(backupData, null, 2);
    fs.writeFileSync(backupFilePath, jsonContent, 'utf8');
    fs.writeFileSync(latestFilePath, jsonContent, 'utf8');

    console.log(`✓ Backup successfully saved to: ${backupFilePath}`);
    console.log(`✓ Latest backup pointer updated: ${latestFilePath}`);
    console.log("\nSummary of backed up records:");
    console.table(backupData.meta.counts);
    console.log("\n=========================================");
    console.log("=== BACKUP COMPLETED SUCCESSFULLY ===");
    console.log("=========================================");

    return backupFilePath;
  } catch (error) {
    console.error("❌ Backup process failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  backupDatabase();
}

module.exports = { backupDatabase };
