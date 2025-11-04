import { v4 as uuidv4 } from 'uuid';

export class OfferId {
  private constructor(private readonly value: string) {}

  static create(): OfferId {
    return new OfferId(uuidv4());
  }

  static from(value: string): OfferId {
    return new OfferId(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: OfferId): boolean {
    return this.value === other.value;
  }
}
