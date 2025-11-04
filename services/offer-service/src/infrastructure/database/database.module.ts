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
        const region = configService.get<string>('AWS_REGION');
        const endpoint = configService.get<string>('AWS_ENDPOINT');
        const accessKeyId = configService.get<string>('AWS_ACCESS_KEY_ID');
        const secretAccessKey = configService.get<string>('AWS_SECRET_ACCESS_KEY');

        if (!region || !endpoint || !accessKeyId || !secretAccessKey) {
          throw new Error(
            'Missing required AWS configuration: AWS_REGION, AWS_ENDPOINT, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY'
          );
        }

        const client = new DynamoDBClient({
          region,
          endpoint,
          credentials: {
            accessKeyId,
            secretAccessKey,
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
