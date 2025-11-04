import { DomainException } from '../../exceptions/domain.exception';

export class Price {
  private constructor(private readonly value: number) {
    this.validate();
  }

  static create(value: number): Price {
    return new Price(value);
  }

  private validate(): void {
    if (this.value < 0) {
      throw new DomainException('Price cannot be negative');
    }
  }

  getValue(): number {
    return this.value;
  }

  equals(other: Price): boolean {
    return this.value === other.value;
  }
}
