import { User } from './user.entity';
import { Email } from '../value-objects/email.vo';
import { Password } from '../value-objects/password.vo';
import { UserId } from '../value-objects/user-id.vo';
import { createTestUser } from '../../../test/fixtures/user.fixture';

describe('User Entity', () => {
  describe('create', () => {
    it('should create new user with hashed password', async () => {
      const email = Email.create('newuser@example.com');
      const password = Password.create('SecurePass123!');
      const mockHasher = jest.fn().mockResolvedValue('hashed_password');

      const user = await User.create(email, password, 'John Doe', mockHasher);

      expect(mockHasher).toHaveBeenCalledWith('SecurePass123!');
      expect(user.email.getValue()).toBe('newuser@example.com');
      expect(user.name).toBe('John Doe');
      expect(user.hashedPassword).toBe('hashed_password');
    });
  });

  describe('reconstitute', () => {
    it('should rebuild user from stored props', () => {
      const testUser = createTestUser();
      expect(testUser.id.getValue()).toBeDefined();
      expect(testUser.email.getValue()).toBe('test@example.com');
      expect(testUser.name).toBe('Test User');
    });
  });

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const testUser = createTestUser();
      const mockComparer = jest.fn().mockResolvedValue(true);

      const result = await testUser.verifyPassword('password123', mockComparer);

      expect(result).toBe(true);
      expect(mockComparer).toHaveBeenCalledWith('password123', testUser.hashedPassword);
    });

    it('should return false for incorrect password', async () => {
      const testUser = createTestUser();
      const mockComparer = jest.fn().mockResolvedValue(false);

      const result = await testUser.verifyPassword('wrongpassword', mockComparer);

      expect(result).toBe(false);
    });
  });

  describe('toObject', () => {
    it('should return user data without password', () => {
      const testUser = createTestUser();
      const obj = testUser.toObject();

      expect(obj).toEqual({
        id: expect.any(String),
        email: 'test@example.com',
        name: 'Test User',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
      expect(obj).not.toHaveProperty('hashedPassword');
    });
  });

  describe('toDb', () => {
    it('should return user data for database persistence', () => {
      const testUser = createTestUser();
      const dbData = testUser.toDb();

      expect(dbData).toEqual({
        id: expect.any(String),
        email: 'test@example.com',
        hashedPassword: testUser.hashedPassword,
        name: 'Test User',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });

  describe('toDomain', () => {
    it('should reconstruct user from database format', () => {
      const dbData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        hashedPassword: 'hashed_password',
        name: 'Test User',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      const user = User.toDomain(dbData);

      expect(user.id.getValue()).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(user.email.getValue()).toBe('user@example.com');
      expect(user.name).toBe('Test User');
    });
  });
});
