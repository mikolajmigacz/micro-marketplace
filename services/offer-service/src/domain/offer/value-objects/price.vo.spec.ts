import { Price } from './price.vo';
import { DomainException } from '../../exceptions/domain.exception';

describe('Price', () => {
  it('should create a valid price', () => {
    const price = Price.create(100);
    expect(price.getValue()).toBe(100);
  });

  it('should not allow negative price', () => {
    expect(() => Price.create(-10)).toThrow(DomainException);
    expect(() => Price.create(-10)).toThrow('Price cannot be negative');
  });

  it('should allow zero price', () => {
    const price = Price.create(0);
    expect(price.getValue()).toBe(0);
  });
});
