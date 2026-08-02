const { query, withTransaction } = require('../config/db');

async function store({ userId, familyId, tokenHash, expiresAt }, client = null) {
  const runner = client || { query };
  await runner.query(
    `INSERT INTO refresh_tokens (user_id, family_id, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [userId, familyId, tokenHash, expiresAt]
  );
}

async function findByHash(tokenHash) {
  const { rows } = await query('SELECT * FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);
  return rows[0] || null;
}


async function rotate({ oldTokenHash, userId, familyId, newTokenHash, expiresAt }) {
  return withTransaction(async (client) => {
    await client.query(
      `UPDATE refresh_tokens SET revoked_at = NOW(), replaced_by_hash = $1
       WHERE token_hash = $2`,
      [newTokenHash, oldTokenHash]
    );
    await store({ userId, familyId, tokenHash: newTokenHash, expiresAt }, client);
  });
}


async function revokeFamily(familyId) {
  await query(
    'UPDATE refresh_tokens SET revoked_at = NOW() WHERE family_id = $1 AND revoked_at IS NULL',
    [familyId]
  );
}

async function revokeToken(tokenHash) {
  await query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1', [tokenHash]);
}

module.exports = { store, findByHash, rotate, revokeFamily, revokeToken };