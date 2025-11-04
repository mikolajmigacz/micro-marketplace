import { Password } from './password.vo';

describe('Password Value Object', () => {
  describe('create', () => {
    it('should create password meeting all requirements', () => {
      const password = Password.create('SecurePass123!');
      expect(password.getValue()).toBe('SecurePass123!');
    });

    it('should throw error for empty password', () => {
      expect(() => Password.create('')).toThrow('Password is required');
    });

    it('should throw error for password shorter than 8 characters', () => {
      expect(() => Password.create('Short1!')).toThrow(
        'Password must be at least 8 characters long'
      );
    });

    it('should throw error for password without uppercase letter', () => {
      expect(() => Password.create('lowercase123!')).toThrow(
        'Password must contain at least one uppercase letter'
      );
    });

    it('should throw error for password without lowercase letter', () => {
      expect(() => Password.create('UPPERCASE123!')).toThrow(
        'Password must contain at least one lowercase letter'
      );
    });

    it('should throw error for password without digit', () => {
      expect(() => Password.create('NoDigits!')).toThrow(
        'Password must contain at least one digit'
      );
    });

    it('should throw error for password without special character', () => {
      expect(() => Password.create('NoSpecial123')).toThrow(
        'Password must contain at least one special character'
      );
    });

    it('should throw error for weak common passwords', () => {
      expect(() => Password.create('Password123!')).toThrow(
        'Password is too common, please choose a stronger password'
      );
    });
  });

  describe('getValue', () => {
    it('should return password value', () => {
      const password = Password.create('ValidPass123!');
      expect(password.getValue()).toBe('ValidPass123!');
    });
  });
});
