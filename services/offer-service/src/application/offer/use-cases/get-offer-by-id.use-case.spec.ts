import { GetOfferByIdUseCase } from './get-offer-by-id.use-case';
import { OfferRepository } from '../../../domain/offer/repositories/offer.repository.interface';
import { Offer } from '../../../domain/offer/entities/offer.entity';
import { Price } from '../../../domain/offer/value-objects/price.vo';
import { OfferNotFoundException } from '../../../domain/exceptions/domain.exception';

describe('GetOfferByIdUseCase', () => {
  let useCase: GetOfferByIdUseCase;
  let repository: jest.Mocked<OfferRepository>;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    } as any;

    useCase = new GetOfferByIdUseCase(repository);
  });

  it('should return offer when found', async () => {
    const offer = Offer.create('Test', 'Desc', 'electronics', Price.create(100), 'user-1');
    repository.findById.mockResolvedValue(offer);

    const result = await useCase.execute('test-id');

    expect(result.title).toBe('Test');
  });

  it('should throw exception when offer not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toThrow(OfferNotFoundException);
  });
});
