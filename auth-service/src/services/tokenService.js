

const tokens = require('../utils/tokens')
const refreshTokenRepo = require('../repositories/refreshTokenRepository')
const { AppError } = require('../middlewares/errorHandler')

async function issueTokenPair(user) {

    const accessToken = tokens.signAccessToken(user)
    const {raw, tokenHash} = tokens.generateRefreshToken()
    const familyId = tokens.newTokenFamilyId()

    await refreshTokenRepo.store({
         userId: user.id,
        familyId,
        tokenHash,
        expiresAt: tokens.refreshExpiryDate(),

    })

     
  return { accessToken, refreshToken: raw };
    
}

async function rotateRefreshToken(rawToken) {

  const tokenHash = tokens.hashToken(rawToken);
  const existing = await refreshTokenRepo.findByHash(tokenHash);
 
  if (!existing) {
    throw new AppError('Refresh token not recognized', 401, 'InvalidToken');
  }

   if (existing.revoked_at || new Date(existing.expires_at) < new Date()) {
    
    await refreshTokenRepo.revokeFamily(existing.family_id);
    throw new AppError('Refresh token has been revoked — please log in again', 401, 'TokenReuseDetected');
  }


  const { raw, tokenHash: newHash } = tokens.generateRefreshToken();
  await refreshTokenRepo.rotate({
    oldTokenHash: tokenHash,
    userId: existing.user_id,
    familyId: existing.family_id,
    newTokenHash: newHash,
    expiresAt: tokens.refreshExpiryDate(),
  });
 
  return { userId: existing.user_id, newRefreshToken: raw };

    
}

async function revokeRefreshToken(rawToken) {
  const tokenHash = tokens.hashToken(rawToken);
  await refreshTokenRepo.revokeToken(tokenHash);
}
 
module.exports = { issueTokenPair, rotateRefreshToken, revokeRefreshToken };

