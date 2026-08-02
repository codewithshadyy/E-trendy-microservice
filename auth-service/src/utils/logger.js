const winston = require('winston');
const env = require('../config/env');

const { combine, timestamp, json, errors } = winston.format;

const logger = winston.createLogger({
  level: env.nodeEnv === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: env.serviceName },
  transports: [new winston.transports.Console()],
});


function withCorrelation(correlationId) {
  return {
    info: (msg, meta = {}) => logger.info(msg, { correlationId, ...meta }),
    warn: (msg, meta = {}) => logger.warn(msg, { correlationId, ...meta }),
    error: (msg, meta = {}) => logger.error(msg, { correlationId, ...meta }),
    debug: (msg, meta = {}) => logger.debug(msg, { correlationId, ...meta }),
  };
}

module.exports = logger;
module.exports.withCorrelation = withCorrelation;