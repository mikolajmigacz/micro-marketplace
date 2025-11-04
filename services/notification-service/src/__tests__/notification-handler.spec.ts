/**
 * Notification Handler Tests
 */

import { NotificationHandler } from '../notification-handler';
import { Logger } from '../logger';
import { OfferCreatedEvent } from '../events';

describe('NotificationHandler', () => {
  let handler: NotificationHandler;
  let loggerSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    const logger = new Logger('NotificationHandler', 'info');
    handler = new NotificationHandler(logger);
    loggerSpy = jest.spyOn(console, 'log');
    warnSpy = jest.spyOn(console, 'warn');
  });

  afterEach(() => {
    loggerSpy.mockClear();
    warnSpy.mockClear();
    jest.restoreAllMocks();
  });

  describe('handleOfferCreated', () => {
    it('should handle OfferCreated event successfully', async () => {
      const event: OfferCreatedEvent = {
        offerId: 'offer-123',
        ownerId: 'user-456',
        category: 'electronics',
        title: 'iPhone 15',
        createdAt: new Date().toISOString(),
      };

      await handler.handleOfferCreated(event);

      expect(loggerSpy).toHaveBeenCalled();
      const logOutput = loggerSpy.mock.calls.join('\n');
      expect(logOutput).toContain('OfferCreated event');
      expect(logOutput).toContain('offer-123');
    });

    it('should send mock email with correct data', async () => {
      const event: OfferCreatedEvent = {
        offerId: 'offer-789',
        ownerId: 'user-111',
        category: 'books',
        title: 'TypeScript Guide',
        createdAt: new Date().toISOString(),
      };

      await handler.handleOfferCreated(event);

      const logOutput = loggerSpy.mock.calls.join('\n');
      expect(logOutput).toContain('Mock Email Sent');
      expect(logOutput).toContain('user_user-111@example.com');
    });
  });

  describe('handle', () => {
    it('should route OfferCreated event correctly', async () => {
      const event: OfferCreatedEvent = {
        offerId: 'offer-999',
        ownerId: 'user-222',
        category: 'furniture',
        title: 'Desk Chair',
        createdAt: new Date().toISOString(),
      };

      await handler.handle(event);

      const logOutput = loggerSpy.mock.calls.join('\n');
      expect(logOutput).toContain('OfferCreated event');
    });

    it('should log warning for unknown event type', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unknownEvent: any = {
        someField: 'value',
      };

      await handler.handle(unknownEvent);

      const warnOutput = warnSpy.mock.calls.map((call) => call.join(' ')).join('\n');
      expect(warnOutput).toContain('Unknown event type');
    });
  });
});
