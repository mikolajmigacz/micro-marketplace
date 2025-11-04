import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LoginUserUseCase } from './login-user.use-case';
import {
  UserRepository,
  USER_REPOSITORY,
} from '../../../domain/user/repositories/user.repository.interface';
import {
  PASSWORD_HASHER,
  IPasswordHasher,
} from '../../../domain/user/services/password-hasher.interface';
import { JWT_SERVICE, IJwtService } from '../../../domain/user/services/jwt.service.interface';
import { LoginUserDto } from '../dto/login-user.dto';
import { createTestUser } from '../../../test/fixtures/user.fixture';

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
  let mockRepository: jest.Mocked<UserRepository>;
  let mockPasswordHasher: jest.Mocked<IPasswordHasher>;
  let mockJwtService: jest.Mocked<IJwtService>;

  beforeEach(async () => {
    mockRepository = {
      save: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };

    mockPasswordHasher = {
      hash: jest.fn(),
      compare: jest.fn().mockResolvedValue(true),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('jwt_token'),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUserUseCase,
        { provide: USER_REPOSITORY, useValue: mockRepository },
        { provide: PASSWORD_HASHER, useValue: mockPasswordHasher },
        { provide: JWT_SERVICE, useValue: mockJwtService },
      ],
    }).compile();

    useCase = module.get<LoginUserUseCase>(LoginUserUseCase);
  });

  describe('execute', () => {
    it('should login user successfully', async () => {
      const testUser = createTestUser({ email: 'user@example.com' });
      mockRepository.findByEmail.mockResolvedValue(testUser);

      const dto: LoginUserDto = {
        email: 'user@example.com',
        password: 'SecurePass123!',
      };

      const result = await useCase.execute(dto);

      expect(result.access_token).toBe('jwt_token');
      expect(result.user.email).toBe('user@example.com');
      expect(mockPasswordHasher.compare).toHaveBeenCalled();
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('should throw error for non-existent user', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);

      const dto: LoginUserDto = {
        email: 'nonexistent@example.com',
        password: 'SecurePass123!',
      };

      await expect(useCase.execute(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw error for incorrect password', async () => {
      const testUser = createTestUser();
      mockRepository.findByEmail.mockResolvedValue(testUser);
      mockPasswordHasher.compare.mockResolvedValue(false);

      const dto: LoginUserDto = {
        email: 'user@example.com',
        password: 'WrongPassword123!',
      };

      await expect(useCase.execute(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
