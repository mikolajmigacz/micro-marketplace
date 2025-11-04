import { OfferId } from './offer-id.vo';

describe('OfferId', () => {
  it('should create a new offer ID', () => {
    const offerId = OfferId.create();
    expect(offerId.getValue()).toBeDefined();
    expect(typeof offerId.getValue()).toBe('string');
  });

  it('should create offer ID from existing value', () => {
    const value = 'test-id';
    const offerId = OfferId.from(value);
    expect(offerId.getValue()).toBe(value);
  });

  it('should check equality correctly', () => {
    const id1 = OfferId.from('same-id');
    const id2 = OfferId.from('same-id');
    const id3 = OfferId.from('different-id');

    expect(id1.equals(id2)).toBe(true);
    expect(id1.equals(id3)).toBe(false);
  });
});
