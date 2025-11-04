import { CreateOfferUseCase } from './create-offer.use-case';
import { OfferRepository } from '../../../domain/offer/repositories/offer.repository.interface';
import { Offer } from '../../../domain/offer/entities/offer.entity';

describe('CreateOfferUseCase', () => {
  let useCase: CreateOfferUseCase;
  let repository: jest.Mocked<OfferRepository>;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    } as any;

    useCase = new CreateOfferUseCase(repository);
  });

  it('should create a offer successfully', async () => {
    const dto = {
      title: 'Test Offer',
      description: 'Test Description',
      category: 'electronics',
      price: 100,
      tags: ['test'],
      photos: [],
    };

    const result = await useCase.execute(dto, 'user-123');

    expect(result.title).toBe('Test Offer');
    expect(result.price).toBe(100);
    expect(result.ownerId).toBe('user-123');
    expect(repository.save).toHaveBeenCalledWith(expect.any(Offer));
  });

  it('should create offer with empty tags and photos', async () => {
    const dto = {
      title: 'Simple Offer',
      description: 'Simple Desc',
      category: 'services',
      price: 50,
    };

    const result = await useCase.execute(dto, 'user-456');

    expect(result.tags).toEqual([]);
    expect(result.photos).toEqual([]);
  });
});
