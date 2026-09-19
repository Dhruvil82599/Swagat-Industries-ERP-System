const fs = require('fs');
const path = require('path');
const { prisma } = require('../src/config/db');

async function restoreDatabase(customFilePath) {
  console.log("=========================================");
  console.log("=== STARTING SWAGAT ERP DATABASE RESTORE ===");
  console.log("=========================================");

  try {
    const backupDir = path.join(__dirname, '..', '..', 'backups');
    let filePath = customFilePath;

    if (!filePath) {
      filePath = path.join(backupDir, 'latest_backup.json');
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`Backup file not found at path: ${filePath}`);
    }

    console.log(`Reading backup file: ${filePath}`);
    const rawData = fs.readFileSync(filePath, 'utf8');
    const backupObj = JSON.parse(rawData);

    if (!backupObj.data) {
      throw new Error("Invalid backup format: missing 'data' key.");
    }

    const {
      users = [],
      companySettings = [],
      quotationTerms = [],
      customers = [],
      industries = [],
      sites = [],
      shutters = [],
      quotations = [],
      quotationItems = [],
      additionalCharges = [],
      payments = []
    } = backupObj.data;

    console.log("Cleaning current database tables (safe dependency order)...");

    await prisma.$transaction(async (tx) => {
      // 1. Delete child records first
      await tx.payment.deleteMany();
      await tx.additionalCharge.deleteMany();
      await tx.quotationItem.deleteMany();
      await tx.quotation.deleteMany();
      await tx.shutter.deleteMany();
      await tx.site.deleteMany();
      await tx.industry.deleteMany();
      await tx.customer.deleteMany();
      await tx.quotationTerm.deleteMany();
      await tx.companySetting.deleteMany();
      await tx.user.deleteMany();

      console.log("✓ Existing database tables wiped clean.");

      // 2. Restore parents to children
      for (const item of users) {
        await tx.user.create({ data: item });
      }
      for (const item of companySettings) {
        await tx.companySetting.create({ data: item });
      }
      for (const item of quotationTerms) {
        await tx.quotationTerm.create({ data: item });
      }
      for (const item of customers) {
        await tx.customer.create({ data: item });
      }
      for (const item of industries) {
        await tx.industry.create({ data: item });
      }
      for (const item of sites) {
        await tx.site.create({ data: item });
      }
      for (const item of shutters) {
        await tx.shutter.create({ data: item });
      }
      for (const item of quotations) {
        await tx.quotation.create({ data: item });
      }
      for (const item of quotationItems) {
        await tx.quotationItem.create({ data: item });
      }
      for (const item of additionalCharges) {
        await tx.additionalCharge.create({ data: item });
      }
      for (const item of payments) {
        await tx.payment.create({ data: item });
      }
    });

    console.log("✓ All tables successfully restored from backup!");
    if (backupObj.meta && backupObj.meta.counts) {
      console.log("\nRestored Record Counts:");
      console.table(backupObj.meta.counts);
    }
    console.log("\n=========================================");
    console.log("=== RESTORE COMPLETED SUCCESSFULLY ===");
    console.log("=========================================");

  } catch (error) {
    console.error("❌ Restore process failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  const targetFile = process.argv[2];
  restoreDatabase(targetFile);
}

module.exports = { restoreDatabase };
