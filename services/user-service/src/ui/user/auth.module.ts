import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './controllers/auth.controller';
import { RegisterUserUseCase } from '../../application/user/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../../application/user/use-cases/login-user.use-case';
import { JwtStrategy } from './guards/jwt.strategy';
import { USER_REPOSITORY } from '../../domain/user/repositories/user.repository.interface';
import { DynamoDBUserRepository } from '../../infrastructure/user/persistence/dynamodb-user.repository';
import { PASSWORD_HASHER } from '../../application/user/services/password-hasher.interface';
import { BcryptPasswordHasher } from '../../infrastructure/user/security/bcrypt-password-hasher.service';
import { JWT_SERVICE } from '../../application/user/services/jwt.service.interface';
import { JwtServiceImpl } from '../../infrastructure/user/security/jwt.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET environment variable is not set');
        }
        return {
          secret,
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUserUseCase,
    LoginUserUseCase,
    JwtStrategy,
    {
      provide: USER_REPOSITORY,
      useClass: DynamoDBUserRepository,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: JWT_SERVICE,
      useClass: JwtServiceImpl,
    },
  ],
  exports: [USER_REPOSITORY, PASSWORD_HASHER, JWT_SERVICE],
})
export class AuthModule {}
