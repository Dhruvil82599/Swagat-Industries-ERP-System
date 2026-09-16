const { prisma } = require('./src/config/db');

async function main() {
  const shutters = await prisma.shutter.findMany({
    include: {
      site: {
        include: {
          industry: {
            include: {
              customer: true
            }
          }
        }
      }
    }
  });

  console.log('=== SHUTTERS IN SHUTTER MASTER CATALOG ===');
  console.log(JSON.stringify(shutters, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
