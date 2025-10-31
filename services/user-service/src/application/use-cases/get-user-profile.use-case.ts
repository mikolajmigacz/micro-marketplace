import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import {
  IUserRepository,
  USER_REPOSITORY,
} from "../../domain/repositories/user.repository.interface";
import { UserId } from "../../domain/value-objects/user-id.value-object";
import { UserResponseDto } from "../dto/user-response.dto";

@Injectable()
export class GetUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository
  ) {}

  async execute(userId: string): Promise<UserResponseDto> {
    const id = UserId.from(userId);
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return new UserResponseDto(user.toObject());
  }
}
