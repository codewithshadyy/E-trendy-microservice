const dotenv = require("dotenv")
dotenv.config()

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4001', 10),
  serviceName: process.env.SERVICE_NAME || 'auth-service',

  db: {
    host: required('DB_HOST', 'localhost'),
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: required('DB_NAME', 'auth_service_db'),
    user: required('DB_USER', 'auth_user'),
    password: required('DB_PASSWORD', 'change_me'),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
  },

  jwt: {
    accessSecret: process.envJWT_ACCESS_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresInDays: parseInt(process.env.JWT_REFRESH_EXPIRES_IN_DAYS || '30', 10),
  },

  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),

  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE || 'ecommerce.events',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },

  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  ttl: {
    emailVerificationHours: parseInt(process.env.EMAIL_VERIFICATION_TTL_HOURS || '24', 10),
    passwordResetMinutes: parseInt(process.env.PASSWORD_RESET_TTL_MINUTES || '30', 10),
  },
};