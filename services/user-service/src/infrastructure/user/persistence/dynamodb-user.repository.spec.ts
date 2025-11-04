import { User } from '../../../domain/user/entities/user.entity';
import { Email } from '../../../domain/user/value-objects/email.vo';
import { Password } from '../../../domain/user/value-objects/password.vo';
import { UserId } from '../../../domain/user/value-objects/user-id.vo';
import { DynamoDBUserRepository } from './dynamodb-user.repository';
import { TestDatabaseHelper } from '../../../test/infrastructure/test-database.helper';
import * as bcrypt from 'bcrypt';

describe('DynamoDBUserRepository - Integration Tests', () => {
  let repository: DynamoDBUserRepository;
  const tableName = 'test-users';
  const mockConfigService = {
    get: jest.fn((key: string) => tableName),
  };
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

  beforeAll(() => {
    TestDatabaseHelper.createTable(tableName);
    repository = new DynamoDBUserRepository(mockDynamoDb as any, mockConfigService as any);
  });

  beforeEach(() => {
    TestDatabaseHelper.clearTable(tableName);
  });

  afterAll(() => {
    TestDatabaseHelper.reset();
  });

  it('should save user and retrieve by ID', async () => {
    const user = await User.create(
      Email.create('test@example.com'),
      Password.create('StrongPass123!'),
      'Test User',
      (pwd: string) => bcrypt.hash(pwd, 10)
    );

    await repository.save(user);
    const foundUser = await repository.findById(user.id);

    expect(foundUser).toBeDefined();
    expect(foundUser?.id.getValue()).toBe(user.id.getValue());
    expect(foundUser?.email.getValue()).toBe('test@example.com');
    expect(foundUser?.name).toBe('Test User');
  });

  it('should save user and retrieve by email', async () => {
    const email = Email.create('unique@example.com');
    const user = await User.create(
      email,
      Password.create('SecurePass456!'),
      'Unique User',
      (pwd: string) => bcrypt.hash(pwd, 10)
    );

    await repository.save(user);
    const foundUser = await repository.findByEmail(email);

    expect(foundUser).toBeDefined();
    expect(foundUser?.email.getValue()).toBe('unique@example.com');
    expect(foundUser?.name).toBe('Unique User');
  });

  it('should return null when user not found', async () => {
    const foundUser = await repository.findByEmail(Email.create('nonexistent@example.com'));

    expect(foundUser).toBeNull();
  });
});
