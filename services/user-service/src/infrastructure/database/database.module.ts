import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export const DYNAMODB_CLIENT = 'DYNAMODB_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: DYNAMODB_CLIENT,
      useFactory: (configService: ConfigService) => {
        const client = new DynamoDBClient({
          region: configService.get<string>('AWS_REGION', 'us-east-1'),
          endpoint: configService.get<string>('AWS_ENDPOINT', 'http://localhost:4566'),
          credentials: {
            accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID', 'test'),
            secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY', 'test'),
          },
        });

        return DynamoDBDocumentClient.from(client);
      },
      inject: [ConfigService],
    },
  ],
  exports: [DYNAMODB_CLIENT],
})
export class DatabaseModule {}
