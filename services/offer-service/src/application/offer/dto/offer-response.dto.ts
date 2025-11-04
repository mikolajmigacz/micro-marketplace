export class OfferResponseDto {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  ownerId: string;
  tags: string[];
  photos: string[];
  createdAt: string;

  constructor(data: {
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    ownerId: string;
    tags: string[];
    photos: string[];
    createdAt: string;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.category = data.category;
    this.price = data.price;
    this.ownerId = data.ownerId;
    this.tags = data.tags;
    this.photos = data.photos;
    this.createdAt = data.createdAt;
  }
}
