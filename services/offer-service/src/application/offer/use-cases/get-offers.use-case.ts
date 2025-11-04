import { Injectable } from '@nestjs/common';
import { OfferRepository } from '../../../domain/offer/repositories/offer.repository.interface';
import { OfferResponseDto } from '../dto/offer-response.dto';

@Injectable()
export class GetOffersUseCase {
  constructor(private readonly offerRepository: OfferRepository) {}

  async execute(): Promise<OfferResponseDto[]> {
    const offers = await this.offerRepository.findAll();
    return offers.map((offer) => new OfferResponseDto(offer.toObject()));
  }
}
