import { Injectable } from '@nestjs/common';
import { OfferRepository } from '../../../domain/offer/repositories/offer.repository.interface';
import { OfferId } from '../../../domain/offer/value-objects/offer-id.vo';
import { OfferResponseDto } from '../dto/offer-response.dto';
import { OfferNotFoundException } from '../../../domain/exceptions/domain.exception';

@Injectable()
export class GetOfferByIdUseCase {
  constructor(private readonly offerRepository: OfferRepository) {}

  async execute(id: string): Promise<OfferResponseDto> {
    const offerId = OfferId.from(id);
    const offer = await this.offerRepository.findById(offerId);

    if (!offer) {
      throw new OfferNotFoundException(id);
    }

    return new OfferResponseDto(offer.toObject());
  }
}
