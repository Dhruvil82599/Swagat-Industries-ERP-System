import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDummyData() {
  console.log('🚀 Starting database cleanup (removing dummy operational data)...');
  console.log('⚠️ Preserving User Management, Invitations, Company Settings, & Terms...');

  try {
    // Delete operational records in safe cascade dependency order
    const deletedPayments = await prisma.payment.deleteMany({});
    console.log(`✓ Deleted ${deletedPayments.count} dummy payments`);

    const deletedAddCharges = await prisma.additionalCharge.deleteMany({});
    console.log(`✓ Deleted ${deletedAddCharges.count} dummy additional charges`);

    const deletedQuotationItems = await prisma.quotationItem.deleteMany({});
    console.log(`✓ Deleted ${deletedQuotationItems.count} dummy quotation items`);

    const deletedQuotations = await prisma.quotation.deleteMany({});
    console.log(`✓ Deleted ${deletedQuotations.count} dummy quotations`);

    const deletedShutters = await prisma.shutter.deleteMany({});
    console.log(`✓ Deleted ${deletedShutters.count} dummy shutters`);

    const deletedSites = await prisma.site.deleteMany({});
    console.log(`✓ Deleted ${deletedSites.count} dummy sites`);

    const deletedIndustries = await prisma.industry.deleteMany({});
    console.log(`✓ Deleted ${deletedIndustries.count} dummy industries`);

    const deletedCustomers = await prisma.customer.deleteMany({});
    console.log(`✓ Deleted ${deletedCustomers.count} dummy customers`);

    console.log('\n--- VERIFYING PRESERVED DATA ---');
    const userCount = await prisma.user.count();
    const inviteCount = await prisma.userInvitation.count();
    const settingsCount = await prisma.companySetting.count();
    const termsCount = await prisma.quotationTerm.count();

    console.log(`✅ Users Intact: ${userCount}`);
    console.log(`✅ User Invitations Intact: ${inviteCount}`);
    console.log(`✅ Company Settings Intact: ${settingsCount}`);
    console.log(`✅ Quotation Terms Intact: ${termsCount}`);
    console.log('\n🎉 All dummy operational data successfully cleaned!');
  } catch (err) {
    console.error('❌ Error during cleanup:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearDummyData();
