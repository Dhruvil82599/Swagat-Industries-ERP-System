const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
});

/**
 * Check database connectivity
 */
async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true };
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return { connected: false, error: error.message };
  }
}

module.exports = {
  prisma,
  checkDatabaseConnection
};
