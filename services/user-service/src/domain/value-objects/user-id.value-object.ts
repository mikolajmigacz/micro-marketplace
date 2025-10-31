import { v4 as uuidv4 } from "uuid";

export class UserId {
  private readonly value: string;

  private constructor(id: string) {
    this.value = id;
  }

  static create(): UserId {
    return new UserId(uuidv4());
  }

  static from(id: string): UserId {
    if (!id) {
      throw new Error("UserId cannot be empty");
    }
    return new UserId(id);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}
