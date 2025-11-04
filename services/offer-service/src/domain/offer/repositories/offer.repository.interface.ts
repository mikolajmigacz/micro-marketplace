import { Offer } from '../entities/offer.entity';
import { OfferId } from '../value-objects/offer-id.vo';

export abstract class OfferRepository {
  abstract save(offer: Offer): Promise<void>;
  abstract findById(id: OfferId): Promise<Offer | null>;
  abstract findAll(): Promise<Offer[]>;
}
