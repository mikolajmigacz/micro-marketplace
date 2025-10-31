import { UserId } from "../value-objects/user-id.value-object";
import { Email } from "../value-objects/email.value-object";
import { Password } from "../value-objects/password.value-object";

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

  static create(
    email: Email,
    password: Password,
    name: string,
    passwordHasher: (password: string) => Promise<string>
  ): Promise<User> {
    return passwordHasher(password.getValue()).then((hashedPassword) => {
      return new User({
        id: UserId.create(),
        email,
        hashedPassword,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  static reconstitute(props: UserProps): User {
    return new User(props);
  }

  // Getters
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

  // Business logic
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
}
