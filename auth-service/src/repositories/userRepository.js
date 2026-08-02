const { query } = require('../config/db');

async function create({ email, passwordHash, role }, client = null) {
  const runner = client || { query };
  const { rows } = await runner.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, $3)
     RETURNING id, email, role, is_verified, is_active, created_at`,
    [email, passwordHash, role]
  );
  return rows[0];
}

async function findByEmail(email) {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await query(
    'SELECT id, email, role, is_verified, is_active, created_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function markVerified(userId) {
  await query('UPDATE users SET is_verified = TRUE WHERE id = $1', [userId]);
}

async function updatePassword(userId, passwordHash) {
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);
}

module.exports = { create, findByEmail, findById, markVerified, updatePassword };