import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { OfferRepository } from '../../../domain/offer/repositories/offer.repository.interface';
import { Offer } from '../../../domain/offer/entities/offer.entity';
import { OfferId } from '../../../domain/offer/value-objects/offer-id.vo';
import { DYNAMODB_CLIENT } from '../../database/database.module';

interface OfferDbRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  ownerId: string;
  tags: string[];
  photos: string[];
  createdAt: string;
}

@Injectable()
export class DynamoDBOfferRepository extends OfferRepository {
  private readonly tableName: string;

  constructor(
    @Inject(DYNAMODB_CLIENT)
    private readonly dynamoDb: DynamoDBDocumentClient,
    private readonly configService: ConfigService
  ) {
    super();
    this.tableName = this.configService.get<string>('DYNAMODB_LISTINGS_TABLE_NAME', 'Listings');
  }

  async save(offer: Offer): Promise<void> {
    await this.dynamoDb.send(
      new PutCommand({
        TableName: this.tableName,
        Item: offer.toDb(),
      })
    );
  }

  async findById(id: OfferId): Promise<Offer | null> {
    const result = await this.dynamoDb.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id: id.getValue() },
      })
    );

    if (!result.Item) {
      return null;
    }

    return Offer.toDomain(result.Item as OfferDbRecord);
  }

  async findAll(): Promise<Offer[]> {
    const result = await this.dynamoDb.send(
      new ScanCommand({
        TableName: this.tableName,
      })
    );

    if (!result.Items || result.Items.length === 0) {
      return [];
    }

    return result.Items.map((item) => Offer.toDomain(item as OfferDbRecord));
  }
}
