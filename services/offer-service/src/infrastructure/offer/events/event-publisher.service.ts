import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

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
  private readonly sqsClient: SQSClient;
  private readonly queueUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.queueUrl = this.configService.get<string>('SQS_QUEUE_URL');
    if (!this.queueUrl) {
      this.logger.warn('SQS_QUEUE_URL not configured - events will not be published');
    }

    this.sqsClient = new SQSClient({
      region: this.configService.get<string>('AWS_REGION', 'us-east-1'),
      endpoint: this.configService.get<string>('AWS_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async publishOfferCreated(event: OfferCreatedEvent): Promise<void> {
    if (!this.queueUrl) {
      this.logger.warn(`[MOCK SQS] Publishing OfferCreated event: ${JSON.stringify(event)}`);
      return;
    }

    try {
      const command = new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(event),
        MessageAttributes: {
          EventType: {
            StringValue: 'OfferCreated',
            DataType: 'String',
          },
        },
      });

      const response = await this.sqsClient.send(command);
      this.logger.log(
        `✅ Published OfferCreated event to SQS: ${event.offerId}`,
        `MessageId: ${response.MessageId}`
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to publish event to SQS: ${JSON.stringify(event)}`,
        error instanceof Error ? error.stack : String(error)
      );
      throw error;
    }
  }
}
