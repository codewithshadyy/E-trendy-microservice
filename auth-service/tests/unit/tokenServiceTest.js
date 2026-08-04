jest.mock('../../src/repositories/refreshTokenRepository');

const refreshTokenRepo = require('../../src/repositories/refreshTokenRepository');
const tokenService = require('../../src/services/tokenService');

describe('tokenService.rotateRefreshToken', () => {
  afterEach(() => jest.clearAllMocks());

  it('throws InvalidToken when the token hash is not found', async () => {
    refreshTokenRepo.findByHash.mockResolvedValue(null);

    await expect(tokenService.rotateRefreshToken('nonexistent-raw-token'))
      .rejects.toMatchObject({ code: 'InvalidToken', statusCode: 401 });
  });

  it('revokes the whole family and throws when a revoked token is replayed', async () => {
    refreshTokenRepo.findByHash.mockResolvedValue({
      user_id: 'user-1',
      family_id: 'family-1',
      revoked_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 100000).toISOString(),
    });

    await expect(tokenService.rotateRefreshToken('reused-raw-token'))
      .rejects.toMatchObject({ code: 'TokenReuseDetected', statusCode: 401 });

    expect(refreshTokenRepo.revokeFamily).toHaveBeenCalledWith('family-1');
  });

  it('rotates successfully for a valid, unused token', async () => {
    refreshTokenRepo.findByHash.mockResolvedValue({
      user_id: 'user-1',
      family_id: 'family-1',
      revoked_at: null,
      expires_at: new Date(Date.now() + 100000).toISOString(),
    });
    refreshTokenRepo.rotate.mockResolvedValue(undefined);

    const result = await tokenService.rotateRefreshToken('valid-raw-token');

    expect(result.userId).toBe('user-1');
    expect(typeof result.newRefreshToken).toBe('string');
    expect(refreshTokenRepo.rotate).toHaveBeenCalledTimes(1);
  });
});