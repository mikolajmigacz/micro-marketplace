import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { PutCommand, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { UserRepository } from '../../../domain/user/repositories/user.repository.interface';
import { User } from '../../../domain/user/entities/user.entity';
import { Email } from '../../../domain/user/value-objects/email.vo';
import { UserId } from '../../../domain/user/value-objects/user-id.vo';
import { DYNAMODB_CLIENT } from '../../database/database.module';

interface UserPersistence {
  id: string;
  email: string;
  hashedPassword: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class DynamoDBUserRepository extends UserRepository {
  private readonly tableName: string;

  constructor(
    @Inject(DYNAMODB_CLIENT)
    private readonly dynamoDb: DynamoDBDocumentClient,
    private readonly configService: ConfigService
  ) {
    super();
    this.tableName = this.configService.get<string>('DYNAMODB_TABLE_NAME', 'Users');
  }

  async save(user: User): Promise<void> {
    const data: UserPersistence = {
      id: user.id.getValue(),
      email: user.email.getValue(),
      hashedPassword: user.hashedPassword,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    await this.dynamoDb.send(
      new PutCommand({
        TableName: this.tableName,
        Item: data,
      })
    );
  }

  async findByEmail(email: Email): Promise<User | null> {
    const result = await this.dynamoDb.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email.getValue(),
        },
      })
    );

    if (!result.Items || result.Items.length === 0) {
      return null;
    }

    return this.toDomain(result.Items[0] as UserPersistence);
  }

  async findById(id: UserId): Promise<User | null> {
    const result = await this.dynamoDb.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id: id.getValue() },
      })
    );

    if (!result.Item) {
      return null;
    }

    return this.toDomain(result.Item as UserPersistence);
  }

  private toDomain(data: UserPersistence): User {
    return User.reconstitute({
      id: UserId.from(data.id),
      email: Email.create(data.email),
      hashedPassword: data.hashedPassword,
      name: data.name,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    });
  }
}
