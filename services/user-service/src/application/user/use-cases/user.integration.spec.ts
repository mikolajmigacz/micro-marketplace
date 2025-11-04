import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RegisterUserUseCase } from './register-user.use-case';
import { LoginUserUseCase } from './login-user.use-case';
import { GetUserProfileUseCase } from './get-user-profile.use-case';
import { DynamoDBUserRepository } from '../../../infrastructure/user/persistence/dynamodb-user.repository';
import { BcryptPasswordHasher } from '../../../infrastructure/user/security/bcrypt-password-hasher.service';
import { JwtServiceImpl } from '../../../infrastructure/user/security/jwt.service';
import { USER_REPOSITORY } from '../../../domain/user/repositories/user.repository.interface';
import { PASSWORD_HASHER } from '../../../domain/user/services/password-hasher.interface';
import { JWT_SERVICE } from '../../../domain/user/services/jwt.service.interface';
import { TestDatabaseHelper } from '../../../test/infrastructure/test-database.helper';
import { DYNAMODB_CLIENT } from '../../../infrastructure/database/database.module';

describe('User Flow - E2E Integration Tests', () => {
  let registerUseCase: RegisterUserUseCase;
  let loginUseCase: LoginUserUseCase;
  let getUserProfileUseCase: GetUserProfileUseCase;
  let jwtService: JwtServiceImpl;
  const tableName = 'test-users';

  const mockDynamoDb = {
    send: jest.fn(async (command: any) => {
      if (command.constructor.name === 'PutCommand') {
        await TestDatabaseHelper.saveItem(tableName, command.input.Item);
        return {};
      }

      if (command.constructor.name === 'GetCommand') {
        const item = await TestDatabaseHelper.getItem(tableName, command.input.Key.id);
        return { Item: item };
      }

      if (command.constructor.name === 'ScanCommand') {
        const email = command.input.ExpressionAttributeValues[':email'];
        const item = await TestDatabaseHelper.queryByEmail(tableName, email);
        return { Items: item ? [item] : [] };
      }

      return {};
    }),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'DYNAMODB_TABLE_NAME') return tableName;
      if (key === 'JWT_SECRET') return 'test-secret-key-for-jwt';
      if (key === 'JWT_EXPIRATION') return '1h';
      if (key === 'BCRYPT_SALT_ROUNDS') return 10;
      return undefined;
    }),
  };

  beforeAll(async () => {
    TestDatabaseHelper.createTable(tableName);

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret-key-for-jwt',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [
        RegisterUserUseCase,
        LoginUserUseCase,
        GetUserProfileUseCase,
        BcryptPasswordHasher,
        JwtServiceImpl,
        {
          provide: USER_REPOSITORY,
          useClass: DynamoDBUserRepository,
        },
        {
          provide: PASSWORD_HASHER,
          useClass: BcryptPasswordHasher,
        },
        {
          provide: JWT_SERVICE,
          useClass: JwtServiceImpl,
        },
        {
          provide: DYNAMODB_CLIENT,
          useValue: mockDynamoDb,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    registerUseCase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
    loginUseCase = module.get<LoginUserUseCase>(LoginUserUseCase);
    getUserProfileUseCase = module.get<GetUserProfileUseCase>(GetUserProfileUseCase);
    jwtService = module.get<JwtServiceImpl>(JwtServiceImpl);
  });

  beforeEach(() => {
    TestDatabaseHelper.clearTable(tableName);
  });

  afterAll(() => {
    TestDatabaseHelper.reset();
  });

  it('should register user and login successfully', async () => {
    const email = 'john@example.com';
    const password = 'SecurePass123!';
    const name = 'John Doe';

    const registerResult = await registerUseCase.execute({
      email,
      password,
      name,
    });

    expect(registerResult).toHaveProperty('access_token');
    expect(registerResult.user.email).toBe(email);
    expect(registerResult.user.name).toBe(name);

    const loginResult = await loginUseCase.execute({
      email,
      password,
    });

    expect(loginResult).toHaveProperty('access_token');
    expect(loginResult.user.email).toBe(email);

    const decoded = jwtService.verify(loginResult.access_token);
    expect((decoded as any).sub).toBe(registerResult.user.id);
    expect((decoded as any).email).toBe(email);
  });

  it('should register user, login and retrieve profile', async () => {
    const email = 'jane@example.com';
    const password = 'StrongPass789!';
    const name = 'Jane Smith';

    const registerResult = await registerUseCase.execute({
      email,
      password,
      name,
    });

    const loginResult = await loginUseCase.execute({
      email,
      password,
    });

    const decoded = jwtService.verify(loginResult.access_token);
    const profile = await getUserProfileUseCase.execute((decoded as any).sub);

    expect(profile.id).toBe(registerResult.user.id);
    expect(profile.email).toBe(email);
    expect(profile.name).toBe(name);
  });

  it('should prevent login with wrong password after registration', async () => {
    const email = 'alice@example.com';
    const password = 'CorrectPass789!';
    const wrongPassword = 'WrongPass000!';

    await registerUseCase.execute({
      email,
      password,
      name: 'Alice',
    });

    await expect(
      loginUseCase.execute({
        email,
        password: wrongPassword,
      })
    ).rejects.toThrow('Invalid credentials');
  });
});
