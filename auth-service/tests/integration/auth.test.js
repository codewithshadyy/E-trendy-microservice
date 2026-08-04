
const request = require('supertest');
const app = require('../../src/app');
const { pool } = require('../../src/config/db');

const testUser = {
  email: `test.${Date.now()}@example.com`,
  password: 'ValidPass123',
};

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
  await pool.end();
});

describe('Auth API', () => {
  let refreshToken;

  it('registers a new user and returns a token pair', async () => {
    const res = await request(app).post('/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('rejects duplicate registration with the same email', async () => {
    const res = await request(app).post('/auth/register').send(testUser);
    expect(res.status).toBe(409);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/auth/login').send(testUser);
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    refreshToken = res.body.refreshToken;
  });

  it('rejects login with wrong password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testUser.email, password: 'WrongPassword1' });
    expect(res.status).toBe(401);
  });

  it('rotates the refresh token successfully', async () => {
    const res = await request(app).post('/auth/refresh').send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.refreshToken).not.toBe(refreshToken);
  });

  it('detects reuse of an already-rotated refresh token', async () => {
    // refreshToken here is now stale — it was rotated in the previous test.
    const res = await request(app).post('/auth/refresh').send({ refreshToken });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('TokenReuseDetected');
  });

  it('rejects access to a protected route without a token', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(401);
  });
});