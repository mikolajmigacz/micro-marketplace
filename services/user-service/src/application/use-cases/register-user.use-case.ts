import { Inject, Injectable, ConflictException } from "@nestjs/common";
import {
  IUserRepository,
  USER_REPOSITORY,
} from "../../domain/repositories/user.repository.interface";
import { User } from "../../domain/entities/user.entity";
import { Email } from "../../domain/value-objects/email.value-object";
import { Password } from "../../domain/value-objects/password.value-object";
import {
  IPasswordHasher,
  PASSWORD_HASHER,
} from "../services/password-hasher.interface";
import { IJwtService, JWT_SERVICE } from "../services/jwt.service.interface";
import { RegisterUserDto } from "../dto/register-user.dto";
import { AuthResponseDto, UserResponseDto } from "../dto/user-response.dto";
import { UserAlreadyExistsException } from "../../domain/exceptions/domain.exceptions";

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(JWT_SERVICE)
    private readonly jwtService: IJwtService
  ) {}

  async execute(dto: RegisterUserDto): Promise<AuthResponseDto> {
    // Create value objects with domain validation
    const email = Email.create(dto.email);
    const password = Password.create(dto.password);

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    // Create user entity
    const user = await User.create(email, password, dto.name, (pwd) =>
      this.passwordHasher.hash(pwd)
    );

    // Save to repository
    await this.userRepository.save(user);

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
