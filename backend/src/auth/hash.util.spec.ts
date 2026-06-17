import { hashPassword, verifyPassword } from './hash.util';

describe('hash.util', () => {
  describe('hashPassword', () => {
    it('should generate a string containing salt and hash separated by a colon', () => {
      const password = 'mySecretPassword';
      const result = hashPassword(password);
      expect(result).toContain(':');
      const parts = result.split(':');
      expect(parts.length).toBe(2);
      expect(parts[0]).toHaveLength(32); // 16 bytes in hex
      expect(parts[1]).toHaveLength(128); // 64 bytes in hex
    });

    it('should generate different hashes for the same password due to unique salt', () => {
      const password = 'samePassword';
      const result1 = hashPassword(password);
      const result2 = hashPassword(password);
      expect(result1).not.toBe(result2);
    });
  });

  describe('verifyPassword', () => {
    it('should return true for a correct password', () => {
      const password = 'correctPassword';
      const storedHash = hashPassword(password);
      const isVerified = verifyPassword(password, storedHash);
      expect(isVerified).toBe(true);
    });

    it('should return false for an incorrect password', () => {
      const password = 'correctPassword';
      const wrongPassword = 'wrongPassword';
      const storedHash = hashPassword(password);
      const isVerified = verifyPassword(wrongPassword, storedHash);
      expect(isVerified).toBe(false);
    });

    it('should return false if the stored hash is invalid or missing parts', () => {
      expect(verifyPassword('password', '')).toBe(false);
      expect(verifyPassword('password', 'justSaltNoHash')).toBe(false);
    });
  });
});
