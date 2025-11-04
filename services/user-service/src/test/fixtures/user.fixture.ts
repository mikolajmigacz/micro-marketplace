import { User } from '../../domain/user/entities/user.entity';
import { Email } from '../../domain/user/value-objects/email.vo';
import { UserId } from '../../domain/user/value-objects/user-id.vo';

export class UserTestDataBuilder {
  private id = UserId.from('123e4567-e89b-12d3-a456-426614174000');
  private email = Email.create('test@example.com');
  private name = 'Test User';
  private hashedPassword = '$2b$10$hashedpassword';
  private createdAt = new Date('2025-01-01');
  private updatedAt = new Date('2025-01-01');

  withId(id: string): UserTestDataBuilder {
    this.id = UserId.from(id);
    return this;
  }

  withEmail(email: string): UserTestDataBuilder {
    this.email = Email.create(email);
    return this;
  }

  withName(name: string): UserTestDataBuilder {
    this.name = name;
    return this;
  }

  withHashedPassword(hashedPassword: string): UserTestDataBuilder {
    this.hashedPassword = hashedPassword;
    return this;
  }

  build(): User {
    return User.reconstitute({
      id: this.id,
      email: this.email,
      hashedPassword: this.hashedPassword,
      name: this.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }
}

export const createTestUser = (
  overrides?: Partial<{
    id: string;
    email: string;
    name: string;
    hashedPassword: string;
  }>
): User => {
  const builder = new UserTestDataBuilder();
  if (overrides?.id) builder.withId(overrides.id);
  if (overrides?.email) builder.withEmail(overrides.email);
  if (overrides?.name) builder.withName(overrides.name);
  if (overrides?.hashedPassword) builder.withHashedPassword(overrides.hashedPassword);
  return builder.build();
};
