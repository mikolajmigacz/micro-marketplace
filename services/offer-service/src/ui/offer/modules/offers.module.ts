import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OffersController } from '../controllers/offers.controller';
import { CreateOfferUseCase } from '../../../application/offer/use-cases/create-offer.use-case';
import { GetOffersUseCase } from '../../../application/offer/use-cases/get-offers.use-case';
import { GetOfferByIdUseCase } from '../../../application/offer/use-cases/get-offer-by-id.use-case';
import { OfferRepository } from '../../../domain/offer/repositories/offer.repository.interface';
import { DynamoDBOfferRepository } from '../../../infrastructure/offer/persistence/dynamodb-offer.repository';
import { JwtValidationService } from '../../../infrastructure/offer/auth/jwt-validation.service';
import { EventPublisherService } from '../../../infrastructure/offer/events/event-publisher.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Module({
  imports: [HttpModule],
  controllers: [OffersController],
  providers: [
    CreateOfferUseCase,
    GetOffersUseCase,
    GetOfferByIdUseCase,
    JwtValidationService,
    EventPublisherService,
    JwtAuthGuard,
    {
      provide: OfferRepository,
      useClass: DynamoDBOfferRepository,
    },
  ],
})
export class OffersModule {}
