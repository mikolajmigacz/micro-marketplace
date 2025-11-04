import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  UserRepository,
  USER_REPOSITORY,
} from '../../../domain/user/repositories/user.repository.interface';
import { Email } from '../../../domain/user/value-objects/email.vo';
import {
  IPasswordHasher,
  PASSWORD_HASHER,
} from '../../../domain/user/services/password-hasher.interface';
import { IJwtService, JWT_SERVICE } from '../../../domain/user/services/jwt.service.interface';
import { LoginUserDto } from '../dto/login-user.dto';
import { AuthResponseDto, UserResponseDto } from '../dto/user-response.dto';

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(JWT_SERVICE)
    private readonly jwtService: IJwtService
  ) {}

  async execute(dto: LoginUserDto): Promise<AuthResponseDto> {
    const email = Email.create(dto.email);

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await user.verifyPassword(dto.password, (plain, hashed) =>
      this.passwordHasher.compare(plain, hashed)
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      sub: user.id.getValue(),
      email: user.email.getValue(),
    });

    const userDto = new UserResponseDto(user.toObject());
    return new AuthResponseDto(token, userDto);
  }
}
