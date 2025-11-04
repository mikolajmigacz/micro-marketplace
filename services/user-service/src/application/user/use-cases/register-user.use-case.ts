import { Inject, Injectable, ConflictException } from '@nestjs/common';
import {
  UserRepository,
  USER_REPOSITORY,
} from '../../../domain/user/repositories/user.repository.interface';
import { User } from '../../../domain/user/entities/user.entity';
import { Email } from '../../../domain/user/value-objects/email.vo';
import { Password } from '../../../domain/user/value-objects/password.vo';
import {
  IPasswordHasher,
  PASSWORD_HASHER,
} from '../../../domain/user/services/password-hasher.interface';
import { IJwtService, JWT_SERVICE } from '../../../domain/user/services/jwt.service.interface';
import { RegisterUserDto } from '../dto/register-user.dto';
import { AuthResponseDto, UserResponseDto } from '../dto/user-response.dto';

/**
 * Register User Use Case
 * Application layer - orchestrates the user registration flow
 */
@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(JWT_SERVICE)
    private readonly jwtService: IJwtService
  ) {}

  async execute(dto: RegisterUserDto): Promise<AuthResponseDto> {
    const email = Email.create(dto.email);
    const password = Password.create(dto.password);

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await User.create(email, password, dto.name, (pwd) =>
      this.passwordHasher.hash(pwd)
    );

    await this.userRepository.save(user);

    const token = this.jwtService.sign({
      sub: user.id.getValue(),
      email: user.email.getValue(),
    });

    const userDto = new UserResponseDto(user.toObject());
    return new AuthResponseDto(token, userDto);
  }
}
