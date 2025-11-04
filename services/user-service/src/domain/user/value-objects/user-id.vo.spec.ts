import { UserId } from './user-id.vo';

describe('UserId Value Object', () => {
  describe('create', () => {
    it('should create new unique UserId', () => {
      const userId = UserId.create();
      expect(userId.getValue()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should create different IDs on each call', () => {
      const userId1 = UserId.create();
      const userId2 = UserId.create();
      expect(userId1.getValue()).not.toBe(userId2.getValue());
    });
  });

  describe('from', () => {
    it('should create UserId from string', () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const userId = UserId.from(id);
      expect(userId.getValue()).toBe(id);
    });

    it('should throw error for empty string', () => {
      expect(() => UserId.from('')).toThrow('UserId cannot be empty');
    });
  });

  describe('equals', () => {
    it('should return true for same ID', () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const userId1 = UserId.from(id);
      const userId2 = UserId.from(id);
      expect(userId1.equals(userId2)).toBe(true);
    });

    it('should return false for different IDs', () => {
      const userId1 = UserId.create();
      const userId2 = UserId.create();
      expect(userId1.equals(userId2)).toBe(false);
    });
  });
});
