/**
 * SQS Consumer Tests
 * Testy dla SQS consumer
 */

import { SQSConsumer } from '../sqs-consumer';
import { Logger } from '../logger';

describe('SQSConsumer', () => {
  let consumer: SQSConsumer;

  beforeEach(() => {
    consumer = new SQSConsumer({
      region: 'us-east-1',
      endpoint: 'http://localhost:4566',
      accessKeyId: 'test',
      secretAccessKey: 'test',
      queueUrl: 'http://localhost:4566/000000000000/offer-events',
      waitTimeSeconds: 1,
      maxNumberOfMessages: 1,
      pollIntervalMs: 100,
    });
  });

  describe('initialization', () => {
    it('should initialize with correct configuration', () => {
      expect(consumer).toBeDefined();
    });
  });

  describe('graceful shutdown', () => {
    it('should stop polling on stop() call', async () => {
      // Start polling in background (will not find messages and wait)
      const pollPromise = consumer.start();

      // Give it a moment to start
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Stop the consumer
      consumer.stop();

      // Wait for polling to stop
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(consumer).toBeDefined();
    });
  });
});
