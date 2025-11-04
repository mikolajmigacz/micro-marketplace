/**
 * SQS Consumer Worker
 * Nasłuchuje wiadomości z SQS i przetwarza je
 */

import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { Logger } from './logger';
import { NotificationHandler } from './notification-handler';
import { SQSMessage } from './events';

export class SQSConsumer {
  private readonly sqsClient: SQSClient;
  private readonly queueUrl: string;
  private readonly logger: Logger;
  private readonly notificationHandler: NotificationHandler;
  private isRunning: boolean = false;

  // Configuration
  private readonly waitTimeSeconds: number;
  private readonly maxNumberOfMessages: number;
  private readonly pollIntervalMs: number;

  constructor(config: {
    region: string;
    endpoint: string;
    accessKeyId: string;
    secretAccessKey: string;
    queueUrl: string;
    waitTimeSeconds?: number;
    maxNumberOfMessages?: number;
    pollIntervalMs?: number;
  }) {
    this.sqsClient = new SQSClient({
      region: config.region,
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    this.queueUrl = config.queueUrl;
    this.waitTimeSeconds = config.waitTimeSeconds || 20;
    this.maxNumberOfMessages = config.maxNumberOfMessages || 10;
    this.pollIntervalMs = config.pollIntervalMs || 5000;

    this.logger = new Logger('SQSConsumer');
    this.notificationHandler = new NotificationHandler(new Logger('NotificationHandler'));
  }

  /**
   * Uruchamia consumer w pętli
   */
  async start(): Promise<void> {
    this.isRunning = true;
    this.logger.info('🚀 Starting SQS Consumer', { queueUrl: this.queueUrl });

    while (this.isRunning) {
      try {
        await this.pollMessages();

        // Czekaj przed następnym pollowaniem
        await new Promise((resolve) => setTimeout(resolve, this.pollIntervalMs));
      } catch (error) {
        this.logger.error('❌ Error polling messages', error as Error);
        // Czekaj zanim spróbujesz ponownie
        await new Promise((resolve) => setTimeout(resolve, this.pollIntervalMs * 2));
      }
    }
  }

  /**
   * Zatrzymuje consumer
   */
  stop(): void {
    this.isRunning = false;
    this.logger.info('🛑 Stopping SQS Consumer');
  }

  /**
   * Polluje wiadomości z SQS
   */
  private async pollMessages(): Promise<void> {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
        WaitTimeSeconds: this.waitTimeSeconds,
        MaxNumberOfMessages: this.maxNumberOfMessages,
      });

      const response = await this.sqsClient.send(command);

      if (!response.Messages || response.Messages.length === 0) {
        // Brak wiadomości - to normalne
        return;
      }

      this.logger.info(`📬 Received ${response.Messages.length} message(s)`, {
        count: response.Messages.length,
      });

      // Przetwórz każdą wiadomość
      for (const message of response.Messages) {
        await this.processMessage(message as SQSMessage);
      }
    } catch (error) {
      // Jeśli to jest błąd połączenia, loguj to
      if (error instanceof Error) {
        this.logger.error('Failed to receive messages from SQS', error);
      }
      throw error;
    }
  }

  /**
   * Przetwarza pojedynczą wiadomość
   */
  private async processMessage(message: SQSMessage): Promise<void> {
    const messageId = message.MessageId;

    try {
      this.logger.info('🔄 Processing message', { messageId });

      // Parse event z message body
      let event: any;
      try {
        event = JSON.parse(message.Body);
      } catch (parseError) {
        this.logger.error('Failed to parse message body', parseError as Error);
        // Usuń wiadomość z błędem parsowania
        await this.deleteMessage(message.ReceiptHandle, messageId);
        return;
      }

      // Obsłuż event
      await this.notificationHandler.handle(event);

      // Usuń wiadomość po pomyślnym przetworzeniu
      await this.deleteMessage(message.ReceiptHandle, messageId);

      this.logger.info('✅ Message processed successfully', { messageId });
    } catch (error) {
      this.logger.error('❌ Error processing message', error as Error);
      // Nie usuwamy wiadomości - SQS wyśle ją ponownie po timeout'cie
    }
  }

  /**
   * Usuwa wiadomość z SQS
   */
  private async deleteMessage(receiptHandle: string, messageId: string): Promise<void> {
    try {
      const command = new DeleteMessageCommand({
        QueueUrl: this.queueUrl,
        ReceiptHandle: receiptHandle,
      });

      await this.sqsClient.send(command);
      this.logger.debug('Message deleted from queue', { messageId });
    } catch (error) {
      this.logger.error('Failed to delete message from queue', error as Error);
      // Nie rzucaj błędu - wiadomość będzie procesowana ponownie
    }
  }
}
