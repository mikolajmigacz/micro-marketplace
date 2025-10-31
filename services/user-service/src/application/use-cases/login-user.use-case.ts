import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import {
  IUserRepository,
  USER_REPOSITORY,
} from "../../domain/repositories/user.repository.interface";
import { Email } from "../../domain/value-objects/email.value-object";
import {
  IPasswordHasher,
  PASSWORD_HASHER,
} from "../services/password-hasher.interface";
import { IJwtService, JWT_SERVICE } from "../services/jwt.service.interface";
import { LoginUserDto } from "../dto/login-user.dto";
import { AuthResponseDto, UserResponseDto } from "../dto/user-response.dto";

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(JWT_SERVICE)
    private readonly jwtService: IJwtService
  ) {}

  async execute(dto: LoginUserDto): Promise<AuthResponseDto> {
    // Create email value object
    const email = Email.create(dto.email);

    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Verify password
    const isPasswordValid = await user.verifyPassword(
      dto.password,
      (plain, hashed) => this.passwordHasher.compare(plain, hashed)
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: user.id.getValue(),
      email: user.email.getValue(),
    });

    // Return response
    const userDto = new UserResponseDto(user.toObject());
    return new AuthResponseDto(token, userDto);
  }
}
