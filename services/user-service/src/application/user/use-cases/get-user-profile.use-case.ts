import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  UserRepository,
  USER_REPOSITORY,
} from '../../../domain/user/repositories/user.repository.interface';
import { UserId } from '../../../domain/user/value-objects/user-id.vo';
import { UserResponseDto } from '../dto/user-response.dto';

@Injectable()
export class GetUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
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
