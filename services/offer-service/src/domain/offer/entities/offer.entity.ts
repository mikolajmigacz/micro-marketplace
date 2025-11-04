import { OfferId } from '../value-objects/offer-id.vo';
import { Price } from '../value-objects/price.vo';

export interface OfferProps {
  id: OfferId;
  title: string;
  description: string;
  category: string;
  price: Price;
  ownerId: string;
  tags: string[];
  photos: string[];
  createdAt: Date;
}

export class Offer {
  private constructor(private readonly props: OfferProps) {}

  static create(
    title: string,
    description: string,
    category: string,
    price: Price,
    ownerId: string,
    tags: string[] = [],
    photos: string[] = []
  ): Offer {
    return new Offer({
      id: OfferId.create(),
      title,
      description,
      category,
      price,
      ownerId,
      tags,
      photos,
      createdAt: new Date(),
    });
  }

  static reconstitute(props: OfferProps): Offer {
    return new Offer(props);
  }

  get id(): OfferId {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get category(): string {
    return this.props.category;
  }

  get price(): Price {
    return this.props.price;
  }

  get ownerId(): string {
    return this.props.ownerId;
  }

  get tags(): string[] {
    return this.props.tags;
  }

  get photos(): string[] {
    return this.props.photos;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  toObject() {
    return {
      id: this.id.getValue(),
      title: this.title,
      description: this.description,
      category: this.category,
      price: this.price.getValue(),
      ownerId: this.ownerId,
      tags: this.tags,
      photos: this.photos,
      createdAt: this.createdAt.toISOString(),
    };
  }

  toDb() {
    return {
      id: this.id.getValue(),
      title: this.title,
      description: this.description,
      category: this.category,
      price: this.price.getValue(),
      ownerId: this.ownerId,
      tags: this.tags,
      photos: this.photos,
      createdAt: this.createdAt.toISOString(),
    };
  }

  static toDomain(data: {
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    ownerId: string;
    tags: string[];
    photos: string[];
    createdAt: string;
  }): Offer {
    return Offer.reconstitute({
      id: OfferId.from(data.id),
      title: data.title,
      description: data.description,
      category: data.category,
      price: Price.create(data.price),
      ownerId: data.ownerId,
      tags: data.tags || [],
      photos: data.photos || [],
      createdAt: new Date(data.createdAt),
    });
  }
}
