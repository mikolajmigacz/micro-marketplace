import { Email } from '../value-objects/email.vo';
import { Password } from '../value-objects/password.vo';
import { UserId } from '../value-objects/user-id.vo';

export interface UserProps {
  id: UserId;
  email: Email;
  hashedPassword: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static async create(
    email: Email,
    password: Password,
    name: string,
    passwordHasher: (password: string) => Promise<string>
  ): Promise<User> {
    const hashedPassword = await passwordHasher(password.getValue());

    return new User({
      id: UserId.create(),
      email,
      hashedPassword,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  get id(): UserId {
    return this.props.id;
  }

  get email(): Email {
    return this.props.email;
  }

  get hashedPassword(): string {
    return this.props.hashedPassword;
  }

  get name(): string {
    return this.props.name;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  async verifyPassword(
    plainPassword: string,
    passwordComparer: (plain: string, hashed: string) => Promise<boolean>
  ): Promise<boolean> {
    return passwordComparer(plainPassword, this.hashedPassword);
  }

  toObject() {
    return {
      id: this.id.getValue(),
      email: this.email.getValue(),
      name: this.name,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  toDb() {
    return {
      id: this.id.getValue(),
      email: this.email.getValue(),
      hashedPassword: this.hashedPassword,
      name: this.name,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  static toDomain(data: {
    id: string;
    email: string;
    hashedPassword: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  }): User {
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
