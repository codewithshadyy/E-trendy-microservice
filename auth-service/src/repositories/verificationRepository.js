const { query } = require('../config/db');


function repositoryFor(table) {
  return {
    async create({ userId, tokenHash, expiresAt }) {
      await query(
        `INSERT INTO ${table} (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
        [userId, tokenHash, expiresAt]
      );
    },
    async findValidByHash(tokenHash) {
      const { rows } = await query(
        `SELECT * FROM ${table}
         WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()`,
        [tokenHash]
      );
      return rows[0] || null;
    },
    async markUsed(id) {
      await query(`UPDATE ${table} SET used_at = NOW() WHERE id = $1`, [id]);
    },
  };
}

module.exports = {
  emailVerifications: repositoryFor('email_verifications'),
  passwordResets: repositoryFor('password_resets'),
};