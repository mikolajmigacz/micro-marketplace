/**
 * Integration Test: SQS → Notification Service
 *
 * Prerequisites: LocalStack running with SQS queue
 * Run: docker-compose up -d localstack aws-init
 */

import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  PurgeQueueCommand,
} from '@aws-sdk/client-sqs';
import { NotificationHandler } from '../notification-handler';
import { Logger } from '../logger';
import { OfferCreatedEvent } from '../events';

describe('Integration: SQS → Notification Service', () => {
  let sqsClient: SQSClient;
  let handler: NotificationHandler;
  const queueUrl = process.env.SQS_QUEUE_URL || 'http://localhost:4566/000000000000/offer-events';
  let loggerSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeAll(() => {
    sqsClient = new SQSClient({
      region: 'us-east-1',
      endpoint: process.env.AWS_ENDPOINT || 'http://localhost:4566',
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
    });

    const logger = new Logger('NotificationHandler', 'info');
    handler = new NotificationHandler(logger);
  });

  beforeEach(async () => {
    loggerSpy = jest.spyOn(console, 'log');
    warnSpy = jest.spyOn(console, 'warn');
    errorSpy = jest.spyOn(console, 'error');

    // Purge queue before each test
    try {
      const purgeCmd = new PurgeQueueCommand({ QueueUrl: queueUrl });
      await sqsClient.send(purgeCmd);
      // Wait for purge to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      // Ignore errors if queue doesn't exist yet
    }
  });

  afterEach(() => {
    loggerSpy.mockClear();
    warnSpy.mockClear();
    errorSpy.mockClear();
    jest.restoreAllMocks();
  });

  describe('OfferCreated Event Flow', () => {
    it('should publish to SQS and handler should process event', async () => {
      const event: OfferCreatedEvent = {
        offerId: 'test-offer-123',
        ownerId: 'test-user-456',
        category: 'electronics',
        title: 'Integration Test Phone',
        createdAt: new Date().toISOString(),
      };

      // 1. Publish event to SQS (simulating Offer Service)
      const sendCommand = new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(event),
        MessageAttributes: {
          EventType: {
            StringValue: 'OfferCreated',
            DataType: 'String',
          },
        },
      });

      const sendResult = await sqsClient.send(sendCommand);
      expect(sendResult.MessageId).toBeDefined();

      // 2. Receive message from SQS (simulating Consumer)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const receiveCommand = new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 5,
      });

      const receiveResult = await sqsClient.send(receiveCommand);
      expect(receiveResult.Messages).toBeDefined();
      expect(receiveResult.Messages!.length).toBeGreaterThan(0);

      const message = receiveResult.Messages![0];
      const receivedEvent = JSON.parse(message.Body!);

      // 3. Process event with handler
      await handler.handle(receivedEvent);

      // 4. Verify handler processed correctly
      const logOutput = loggerSpy.mock.calls.join('\n');
      expect(logOutput).toContain('OfferCreated event');
      expect(logOutput).toContain('test-offer-123');
      expect(logOutput).toContain('Mock Email Sent');

      // 5. Delete message from queue
      const deleteCommand = new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: message.ReceiptHandle!,
      });

      await sqsClient.send(deleteCommand);
    }, 15000);

    it('should handle multiple events', async () => {
      const events: OfferCreatedEvent[] = [
        {
          offerId: 'offer-1',
          ownerId: 'user-1',
          category: 'books',
          title: 'TypeScript Book',
          createdAt: new Date().toISOString(),
        },
        {
          offerId: 'offer-2',
          ownerId: 'user-2',
          category: 'electronics',
          title: 'Laptop',
          createdAt: new Date().toISOString(),
        },
      ];

      // Publish all events
      for (const event of events) {
        const cmd = new SendMessageCommand({
          QueueUrl: queueUrl,
          MessageBody: JSON.stringify(event),
        });
        await sqsClient.send(cmd);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Process events
      for (let i = 0; i < events.length; i++) {
        const receiveCommand = new ReceiveMessageCommand({
          QueueUrl: queueUrl,
          MaxNumberOfMessages: 1,
          WaitTimeSeconds: 5,
        });

        const result = await sqsClient.send(receiveCommand);
        if (result.Messages && result.Messages.length > 0) {
          const msg = result.Messages[0];
          const evt = JSON.parse(msg.Body!);
          await handler.handle(evt);

          // Delete message
          const deleteCmd = new DeleteMessageCommand({
            QueueUrl: queueUrl,
            ReceiptHandle: msg.ReceiptHandle!,
          });
          await sqsClient.send(deleteCmd);
        }
      }

      const logOutput = loggerSpy.mock.calls.join('\n');
      expect(logOutput).toContain('offer-1');
      expect(logOutput).toContain('offer-2');
    }, 20000);
  });

  describe('Error Handling', () => {
    it('should handle unknown event types gracefully', async () => {
      const unknownEvent = {
        someField: 'value',
        randomData: 123,
      };

      const cmd = new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(unknownEvent),
      });

      await sqsClient.send(cmd);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const receiveCommand = new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 5,
      });

      const result = await sqsClient.send(receiveCommand);
      if (result.Messages && result.Messages.length > 0) {
        const msg = result.Messages[0];
        const evt = JSON.parse(msg.Body!);

        await handler.handle(evt);

        const warnOutput = warnSpy.mock.calls.map((call) => call.join(' ')).join('\n');
        expect(warnOutput).toContain('Unknown event type');

        // Clean up
        const deleteCmd = new DeleteMessageCommand({
          QueueUrl: queueUrl,
          ReceiptHandle: msg.ReceiptHandle!,
        });
        await sqsClient.send(deleteCmd);
      }
    }, 15000);
  });
});
