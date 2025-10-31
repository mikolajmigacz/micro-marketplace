import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { AuthController } from "../controllers/auth.controller";
import { RegisterUserUseCase } from "../../application/use-cases/register-user.use-case";
import { LoginUserUseCase } from "../../application/use-cases/login-user.use-case";
import { JwtStrategy } from "../guards/jwt.strategy";
import { USER_REPOSITORY } from "../../domain/repositories/user.repository.interface";
import { DynamoDBUserRepository } from "../../infrastructure/persistence/dynamodb-user.repository";
import { PASSWORD_HASHER } from "../../application/services/password-hasher.interface";
import { BcryptPasswordHasher } from "../../infrastructure/security/bcrypt-password-hasher.service";
import { JWT_SERVICE } from "../../application/services/jwt.service.interface";
import { JwtServiceImpl } from "../../infrastructure/security/jwt.service";

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get(
          "JWT_SECRET",
          "your-secret-key-change-in-production"
        ),
        signOptions: {
          expiresIn: configService.get("JWT_EXPIRES_IN", "7d"),
        },
      }),
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
