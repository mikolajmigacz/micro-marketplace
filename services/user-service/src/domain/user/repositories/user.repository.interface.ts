import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email.vo';
import { UserId } from '../value-objects/user-id.vo';

export abstract class UserRepository {
  abstract save(user: User): Promise<void>;
  abstract findByEmail(email: Email): Promise<User | null>;
  abstract findById(id: UserId): Promise<User | null>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
