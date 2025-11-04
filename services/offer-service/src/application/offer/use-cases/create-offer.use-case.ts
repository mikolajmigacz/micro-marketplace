import { Injectable } from '@nestjs/common';
import { OfferRepository } from '../../../domain/offer/repositories/offer.repository.interface';
import { Offer } from '../../../domain/offer/entities/offer.entity';
import { Price } from '../../../domain/offer/value-objects/price.vo';
import { CreateOfferDto } from '../dto/create-offer.dto';
import { OfferResponseDto } from '../dto/offer-response.dto';

@Injectable()
export class CreateOfferUseCase {
  constructor(private readonly offerRepository: OfferRepository) {}

  async execute(dto: CreateOfferDto, ownerId: string): Promise<OfferResponseDto> {
    const price = Price.create(dto.price);

    const offer = Offer.create(
      dto.title,
      dto.description,
      dto.category,
      price,
      ownerId,
      dto.tags || [],
      dto.photos || []
    );

    await this.offerRepository.save(offer);

    return new OfferResponseDto(offer.toObject());
  }
}
