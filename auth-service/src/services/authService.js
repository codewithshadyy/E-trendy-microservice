
const crypto = require('crypto');
const userRepo = require('../repositories/userRepository');
const verificationRepo = require('../repositories/verificationRepository');
const password = require('../utils/password');
const tokenUtils = require('../utils/tokens');
const tokenService = require('./tokenService');
const publisher = require('../events/publisher');
const { AppError } = require('../middlewares/errorHandler');
const env = require('../config/env');
 
function generateOpaqueToken() {
  const raw = crypto.randomBytes(32).toString('hex');
  return { raw, hash: tokenUtils.hashToken(raw) };
}



async function register({ email, password: plainPassword, role }) {
  const existing = await userRepo.findByEmail(email);
  if (existing) {

    throw new AppError('Unable to register with the provided details', 409, 'RegistrationConflict');
  }
 
  const passwordHash = await password.hash(plainPassword);
  const user = await userRepo.create({ email, passwordHash, role });
 
  const { raw, hash } = generateOpaqueToken();
  const expiresAt = new Date(Date.now() + env.ttl.emailVerificationHours * 3600 * 1000);
  await verificationRepo.emailVerifications.create({ userId: user.id, tokenHash: hash, expiresAt });
 
  
  await publisher.publishUserRegistered(user);
 
  const tokenPair = await tokenService.issueTokenPair(user);
 
  return {
    user: { id: user.id, email: user.email, role: user.role, isVerified: user.is_verified },
    ...tokenPair,
    emailVerificationToken: raw,
  };
}


async function login({ email, password: plainPassword }) {
  const user = await userRepo.findByEmail(email);
  if (!user || !user.is_active) {
    throw new AppError('Invalid email or password', 401, 'InvalidCredentials');
  }
 
  const valid = await password.verify(plainPassword, user.password_hash);
  if (!valid) {
    throw new AppError('Invalid email or password', 401, 'InvalidCredentials');
  }
 
  const tokenPair = await tokenService.issueTokenPair(user);
  return {
    user: { id: user.id, email: user.email, role: user.role, isVerified: user.is_verified },
    ...tokenPair,
  };
}


async function refresh(rawRefreshToken) {
  const { userId, newRefreshToken } = await tokenService.rotateRefreshToken(rawRefreshToken);
  const user = await userRepo.findById(userId);
  if (!user || !user.is_active) {
    throw new AppError('User account no longer active', 401, 'InvalidCredentials');
  }
  const accessToken = require('../utils/tokens').signAccessToken(user);
  return { accessToken, refreshToken: newRefreshToken };
}
 
async function logout(rawRefreshToken) {
  await tokenService.revokeRefreshToken(rawRefreshToken);
}




async function logout(rawRefreshToken) {
  await tokenService.revokeRefreshToken(rawRefreshToken);
}
 
async function verifyEmail(rawToken) {
  const tokenHash = tokenUtils.hashToken(rawToken);
  const record = await verificationRepo.emailVerifications.findValidByHash(tokenHash);
  if (!record) {
    throw new AppError('Verification link is invalid or has expired', 400, 'InvalidVerificationToken');
  }
  await userRepo.markVerified(record.user_id);
  await verificationRepo.emailVerifications.markUsed(record.id);
}

async function forgotPassword(email) {
  const user = await userRepo.findByEmail(email);
  if (!user) {
   
    return;
  }
  const { raw, hash } = generateOpaqueToken();
  const expiresAt = new Date(Date.now() + env.ttl.passwordResetMinutes * 60 * 1000);
  await verificationRepo.passwordResets.create({ userId: user.id, tokenHash: hash, expiresAt });
 
  await publisher.publishEvent('auth.password_reset_requested', {
    userId: user.id,
    email: user.email,
    resetToken: raw,   //i will leta email later
  });
}
 
async function resetPassword({ token, newPassword }) {
  const tokenHash = tokenUtils.hashToken(token);
  const record = await verificationRepo.passwordResets.findValidByHash(tokenHash);
  if (!record) {
    throw new AppError('Reset link is invalid or has expired', 400, 'InvalidResetToken');
  }
  const passwordHash = await password.hash(newPassword);
  await userRepo.updatePassword(record.user_id, passwordHash);
  await verificationRepo.passwordResets.markUsed(record.id);
}
 
module.exports = {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
};