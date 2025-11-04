// Load environment variables from .env file
require('dotenv').config();

import { Logger } from './logger';
import { SQSConsumer } from './sqs-consumer';

const logger = new Logger('NotificationService');

/**
 * Notification Service - SQS Consumer Worker
 * Nasłuchuje zdarzeń z SQS i przetwarza powiadomienia
 */
async function bootstrap(): Promise<void> {
  logger.info('🚀 Starting Notification Service Worker');

  // Validate environment variables
  const requiredEnvVars = [
    'AWS_REGION',
    'AWS_ENDPOINT',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'SQS_QUEUE_URL',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      logger.error(`Missing required environment variable: ${envVar}`, new Error(`${envVar} is required`));
      process.exit(1);
    }
  }

  // Initialize SQS Consumer
  const consumer = new SQSConsumer({
    region: process.env.AWS_REGION!,
    endpoint: process.env.AWS_ENDPOINT!,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    queueUrl: process.env.SQS_QUEUE_URL!,
    waitTimeSeconds: parseInt(process.env.SQS_WAIT_TIME_SECONDS || '20'),
    maxNumberOfMessages: parseInt(process.env.SQS_MAX_NUMBER_OF_MESSAGES || '10'),
    pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS || '5000'),
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    logger.info('Received SIGINT signal, shutting down gracefully...');
    consumer.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    logger.info('Received SIGTERM signal, shutting down gracefully...');
    consumer.stop();
    process.exit(0);
  });

  // Start the consumer
  try {
    await consumer.start();
  } catch (error) {
    logger.error('Fatal error in notification service', error as Error);
    process.exit(1);
  }
}

bootstrap();
