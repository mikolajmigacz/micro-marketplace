import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { RegisterUserUseCase } from './register-user.use-case';
import {
  UserRepository,
  USER_REPOSITORY,
} from '../../../domain/user/repositories/user.repository.interface';
import {
  PASSWORD_HASHER,
  IPasswordHasher,
} from '../../../domain/user/services/password-hasher.interface';
import { JWT_SERVICE, IJwtService } from '../../../domain/user/services/jwt.service.interface';
import { RegisterUserDto } from '../dto/register-user.dto';
import { createTestUser } from '../../../test/fixtures/user.fixture';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let mockRepository: jest.Mocked<UserRepository>;
  let mockPasswordHasher: jest.Mocked<IPasswordHasher>;
  let mockJwtService: jest.Mocked<IJwtService>;

  beforeEach(async () => {
    mockRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findByEmail: jest.fn().mockResolvedValue(null),
      findById: jest.fn().mockResolvedValue(null),
    };

    mockPasswordHasher = {
      hash: jest.fn().mockResolvedValue('hashed_password'),
      compare: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('jwt_token'),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        { provide: USER_REPOSITORY, useValue: mockRepository },
        { provide: PASSWORD_HASHER, useValue: mockPasswordHasher },
        { provide: JWT_SERVICE, useValue: mockJwtService },
      ],
    }).compile();

    useCase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
  });

  describe('execute', () => {
    it('should register new user successfully', async () => {
      const dto: RegisterUserDto = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        name: 'New User',
      };

      const result = await useCase.execute(dto);

      expect(result.access_token).toBe('jwt_token');
      expect(result.user.email).toBe('newuser@example.com');
      expect(result.user.name).toBe('New User');
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockPasswordHasher.hash).toHaveBeenCalledWith('SecurePass123!');
    });

    it('should throw error when email already exists', async () => {
      const existingUser = createTestUser({ email: 'existing@example.com' });
      mockRepository.findByEmail.mockResolvedValue(existingUser);

      const dto: RegisterUserDto = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
        name: 'User',
      };

      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
