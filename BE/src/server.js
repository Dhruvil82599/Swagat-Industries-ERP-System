const app = require('./app');
const { PORT } = require('./config');
const { checkDatabaseConnection, prisma } = require('./config/db');

async function startServer() {
  try {
    // Verify database connectivity
    console.log('Connecting to PostgreSQL database...');
    const dbStatus = await checkDatabaseConnection();
    if (!dbStatus.connected) {
      console.error('❌ Failed to connect to PostgreSQL database:', dbStatus.error);
      process.exit(1);
    }
    console.log('✔ Connected to PostgreSQL database (swagat_erp) via Prisma Client.');

    const server = app.listen(PORT, () => {
      console.log(`🚀 Swagat ERP Backend Server running on http://localhost:${PORT}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Closing HTTP server and database connections...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('✔ Server closed cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (error) {
    console.error('Fatal server startup error:', error);
    process.exit(1);
  }
}

startServer();
