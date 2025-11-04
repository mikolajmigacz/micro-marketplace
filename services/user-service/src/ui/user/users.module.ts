import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { GetUserProfileUseCase } from '../../application/user/use-cases/get-user-profile.use-case';
import { USER_REPOSITORY } from '../../domain/user/repositories/user.repository.interface';
import { DynamoDBUserRepository } from '../../infrastructure/user/persistence/dynamodb-user.repository';

@Module({
  controllers: [UsersController],
  providers: [
    GetUserProfileUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: DynamoDBUserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}
