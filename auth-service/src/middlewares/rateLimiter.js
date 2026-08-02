const rateLimit   = require("express-rate-limit")
const env = require("../config/env")

const generalLimiter = rateLimit({
    windowMs:env.rateLimit.windowMs,
    max:env.rateLimit.max,
    standardHeaders:true,
    legacyHeaders:false,
    message: { error: 'TooManyRequests', message: 'Rate limit exceeded, try again later' },

})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'TooManyRequests', message: 'Too many attempts, please try again in 15 minutes' },
});

module.exports = {
    authLimiter, generalLimiter
}