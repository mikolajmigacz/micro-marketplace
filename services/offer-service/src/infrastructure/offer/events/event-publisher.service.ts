import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface OfferCreatedEvent {
  offerId: string;
  ownerId: string;
  category: string;
  title: string;
  createdAt: string;
}

@Injectable()
export class EventPublisherService {
  private readonly logger = new Logger(EventPublisherService.name);

  constructor(private readonly configService: ConfigService) {}

  async publishOfferCreated(event: OfferCreatedEvent): Promise<void> {
    this.logger.log(`[MOCK SQS] Publishing OfferCreated event: ${JSON.stringify(event)}`);
  }
}
