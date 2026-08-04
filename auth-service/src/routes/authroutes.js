
const express = require('express');
const controller = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { requireAuth } = require('../middlewares/authGuard');
const { authLimiter } = require('../middlewares/rateLimiter');
const dtos = require('../dtos/authDtos');
 
const router = express.Router();


router.post('/register', authLimiter, validate(dtos.registerSchema), controller.register);
router.post('/login', authLimiter, validate(dtos.loginSchema), controller.login);
router.post('/refresh', validate(dtos.refreshSchema), controller.refresh);
router.post('/logout', validate(dtos.logoutSchema), controller.logout);
router.post('/verify-email', validate(dtos.verifyEmailSchema), controller.verifyEmail);
router.post('/forgot-password', authLimiter, validate(dtos.forgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', validate(dtos.resetPasswordSchema), controller.resetPassword);
router.get('/me', requireAuth, controller.me);
 
module.exports = router;
 