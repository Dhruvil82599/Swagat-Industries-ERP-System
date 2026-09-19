import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  console.log('--- CURRENT DATABASE RECORD COUNTS ---');
  console.log('1. Customers:', await prisma.customer.count());
  console.log('2. Industries:', await prisma.industry.count());
  console.log('3. Sites:', await prisma.site.count());
  console.log('4. Shutters:', await prisma.shutter.count());
  console.log('5. Quotations:', await prisma.quotation.count());
  console.log('6. QuotationItems:', await prisma.quotationItem.count());
  console.log('7. AdditionalCharges:', await prisma.additionalCharge.count());
  console.log('8. Payments:', await prisma.payment.count());
  console.log('--------------------------------------');
  console.log('9. Users (PRESERVE):', await prisma.user.count());
  console.log('10. UserInvitations (PRESERVE):', await prisma.userInvitation.count());
  console.log('11. CompanySettings (PRESERVE):', await prisma.companySetting.count());
  console.log('12. QuotationTerms (PRESERVE):', await prisma.quotationTerm.count());

  await prisma.$disconnect();
}

checkData().catch(err => {
  console.error(err);
  process.exit(1);
});
