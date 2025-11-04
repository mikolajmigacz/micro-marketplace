import { Offer } from './offer.entity';
import { Price } from '../value-objects/price.vo';

describe('Offer Entity', () => {
  it('should create a new offer', () => {
    const price = Price.create(100);
    const offer = Offer.create('Title', 'Description', 'electronics', price, 'user-123');

    expect(offer.title).toBe('Title');
    expect(offer.description).toBe('Description');
    expect(offer.category).toBe('electronics');
    expect(offer.price.getValue()).toBe(100);
    expect(offer.ownerId).toBe('user-123');
  });

  it('should reconstitute offer from database data', () => {
    const data = {
      id: 'test-id',
      title: 'Test',
      description: 'Desc',
      category: 'services',
      price: 50,
      ownerId: 'owner-123',
      tags: ['tag1'],
      photos: ['photo1.jpg'],
      createdAt: '2025-11-04T10:00:00.000Z',
    };

    const offer = Offer.toDomain(data);
    expect(offer.id.getValue()).toBe('test-id');
    expect(offer.title).toBe('Test');
    expect(offer.price.getValue()).toBe(50);
  });

  it('should convert offer to database format', () => {
    const price = Price.create(200);
    const offer = Offer.create('Title', 'Desc', 'products', price, 'owner-456', ['ai', 'ml']);

    const dbData = offer.toDb();
    expect(dbData.title).toBe('Title');
    expect(dbData.price).toBe(200);
    expect(dbData.tags).toEqual(['ai', 'ml']);
  });
});
