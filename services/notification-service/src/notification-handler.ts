/**
 * Notification Handler
 * Obsługuje różne typy zdarzeń i wysyła powiadomienia
 */

import { Logger } from './logger';
import { OfferCreatedEvent, Event } from './events';

export class NotificationHandler {
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Obsługuje zdarzenie OfferCreated
   */
  async handleOfferCreated(event: OfferCreatedEvent): Promise<void> {
    this.logger.info('📧 Handling OfferCreated event', {
      offerId: event.offerId,
      ownerId: event.ownerId,
      title: event.title,
      category: event.category,
    });

    try {
      // Wysyłanie powiadomienia (mock email)
      await this.sendEmail(
        `user_${event.ownerId}@example.com`,
        `Your offer "${event.title}" was created successfully!`,
        {
          offerId: event.offerId,
          category: event.category,
          createdAt: event.createdAt,
        }
      );

      this.logger.info('✅ Notification sent successfully', {
        offerId: event.offerId,
        ownerId: event.ownerId,
      });
    } catch (error) {
      this.logger.error('❌ Failed to send notification', error as Error);
      throw error;
    }
  }

  /**
   * Mock email sender
   * W produkcji - nodemailer, SendGrid, SES, itp.
   */
  private async sendEmail(
    recipient: string,
    subject: string,
    data: Record<string, any>
  ): Promise<void> {
    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    this.logger.info('📮 Mock Email Sent', {
      recipient,
      subject,
      data,
    });

    // W produkcji:
    // return await this.emailService.send({ to: recipient, subject, html: template })
  }

  /**
   * Route events do odpowiednich handlerów
   */
  async handle(event: Event): Promise<void> {
    // Sprawdzanie typu eventu po polach
    if (this.isOfferCreatedEvent(event)) {
      await this.handleOfferCreated(event);
    } else {
      this.logger.warn('Unknown event type', { event });
    }
  }

  private isOfferCreatedEvent(event: any): event is OfferCreatedEvent {
    return (
      event &&
      typeof event === 'object' &&
      'offerId' in event &&
      'ownerId' in event &&
      'title' in event &&
      'category' in event
    );
  }
}
