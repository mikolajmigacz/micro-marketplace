/**
 * Event types and interfaces
 */

export interface OfferCreatedEvent {
  offerId: string;
  ownerId: string;
  category: string;
  title: string;
  createdAt: string;
}

export interface SQSMessage {
  MessageId: string;
  ReceiptHandle: string;
  Body: string;
  Attributes: Record<string, string>;
}

export type Event = OfferCreatedEvent;
