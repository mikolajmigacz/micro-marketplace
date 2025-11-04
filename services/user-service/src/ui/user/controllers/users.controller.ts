import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { GetUserProfileUseCase } from '../../../application/user/use-cases/get-user-profile.use-case';
import { UserResponseDto } from '../../../application/user/dto/user-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly getUserProfileUseCase: GetUserProfileUseCase) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.getUserProfileUseCase.execute(id);
  }
}
