import { GetOffersUseCase } from './get-offers.use-case';
import { OfferRepository } from '../../../domain/offer/repositories/offer.repository.interface';
import { Offer } from '../../../domain/offer/entities/offer.entity';
import { Price } from '../../../domain/offer/value-objects/price.vo';

describe('GetOffersUseCase', () => {
  let useCase: GetOffersUseCase;
  let repository: jest.Mocked<OfferRepository>;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    } as any;

    useCase = new GetOffersUseCase(repository);
  });

  it('should return all offers', async () => {
    const offers = [
      Offer.create('Offer 1', 'Desc 1', 'electronics', Price.create(100), 'user-1'),
      Offer.create('Offer 2', 'Desc 2', 'services', Price.create(200), 'user-2'),
    ];

    repository.findAll.mockResolvedValue(offers);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Offer 1');
    expect(result[1].title).toBe('Offer 2');
  });

  it('should return empty array when no offers exist', async () => {
    repository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
