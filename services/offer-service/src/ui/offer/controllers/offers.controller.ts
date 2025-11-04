import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { CreateOfferUseCase } from '../../../application/offer/use-cases/create-offer.use-case';
import { GetOffersUseCase } from '../../../application/offer/use-cases/get-offers.use-case';
import { GetOfferByIdUseCase } from '../../../application/offer/use-cases/get-offer-by-id.use-case';
import { CreateOfferDto } from '../../../application/offer/dto/create-offer.dto';
import { OfferResponseDto } from '../../../application/offer/dto/offer-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { EventPublisherService } from '../../../infrastructure/offer/events/event-publisher.service';

@Controller('offers')
export class OffersController {
  constructor(
    private readonly createOfferUseCase: CreateOfferUseCase,
    private readonly getOffersUseCase: GetOffersUseCase,
    private readonly getOfferByIdUseCase: GetOfferByIdUseCase,
    private readonly eventPublisher: EventPublisherService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createOffer(
    @Body() dto: CreateOfferDto,
    @CurrentUser() user: { userId: string }
  ): Promise<OfferResponseDto> {
    const offer = await this.createOfferUseCase.execute(dto, user.userId);

    await this.eventPublisher.publishOfferCreated({
      offerId: offer.id,
      ownerId: offer.ownerId,
      category: offer.category,
      title: offer.title,
      createdAt: offer.createdAt,
    });

    return offer;
  }

  @Get()
  async getOffers(): Promise<OfferResponseDto[]> {
    return this.getOffersUseCase.execute();
  }

  @Get(':id')
  async getOfferById(@Param('id') id: string): Promise<OfferResponseDto> {
    return this.getOfferByIdUseCase.execute(id);
  }
}
