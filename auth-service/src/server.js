const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const { pool } = require('./config/db');

const server = app.listen(env.port, () => {
  logger.info(`${env.serviceName} listening on port ${env.port}`, { env: env.nodeEnv });
});

// Graceful shutdown — important in Kubernetes: SIGTERM is sent before a
// pod is killed, and the pod gets a grace period to finish in-flight
// requests and close connections cleanly.
async function shutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully`);
  server.close(async () => {
    await pool.end();
    logger.info('Shutdown complete');
    process.exit(0);
  });

  // Force exit if graceful shutdown hangs
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { reason: reason?.message || reason });
});