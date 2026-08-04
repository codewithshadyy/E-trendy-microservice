const password = require('../../src/utils/password');

describe('password utils', () => {
  it('hashes a password to a bcrypt string distinct from the plaintext', async () => {
    const hash = await password.hash('SuperSecret123');
    expect(hash).not.toBe('SuperSecret123');
    expect(hash.startsWith('$2')).toBe(true);
  });

  it('verifies a correct password against its hash', async () => {
    const hash = await password.hash('SuperSecret123');
    await expect(password.verify('SuperSecret123', hash)).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await password.hash('SuperSecret123');
    await expect(password.verify('WrongPassword', hash)).resolves.toBe(false);
  });
});