import { BcryptPasswordHasher } from './bcrypt-password-hasher.service';
import { ConfigService } from '@nestjs/config';

describe('BcryptPasswordHasher', () => {
  let service: BcryptPasswordHasher;
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'BCRYPT_SALT_ROUNDS') return 10;
        return undefined;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    service = new BcryptPasswordHasher(mockConfigService);
  });

  describe('hash', () => {
    it('should hash password', async () => {
      const password = 'SecurePass123!';
      const hashedPassword = await service.hash(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });
  });

  describe('compare', () => {
    it('should return true for correct password', async () => {
      const password = 'SecurePass123!';
      const hashedPassword = await service.hash(password);

      const result = await service.compare(password, hashedPassword);

      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'SecurePass123!';
      const hashedPassword = await service.hash(password);

      const result = await service.compare('WrongPassword123!', hashedPassword);

      expect(result).toBe(false);
    });
  });
});
