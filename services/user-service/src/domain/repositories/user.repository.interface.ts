import { User } from "../entities/user.entity";
import { Email } from "../value-objects/email.value-object";
import { UserId } from "../value-objects/user-id.value-object";

export interface IUserRepository {
  save(user: User): Promise<void>;
  findByEmail(email: Email): Promise<User | null>;
  findById(id: UserId): Promise<User | null>;
}

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");
