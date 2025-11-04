import { Controller, Post, Body, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { RegisterUserUseCase } from '../../../application/user/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../../../application/user/use-cases/login-user.use-case';
import { RegisterUserDto } from '../../../application/user/dto/register-user.dto';
import { LoginUserDto } from '../../../application/user/dto/login-user.dto';
import { AuthResponseDto } from '../../../application/user/dto/user-response.dto';
import { Inject } from '@nestjs/common';
import { IJwtService, JWT_SERVICE } from '../../../application/user/services/jwt.service.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    @Inject(JWT_SERVICE)
    private readonly jwtService: IJwtService
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto): Promise<AuthResponseDto> {
    return this.registerUserUseCase.execute(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto): Promise<AuthResponseDto> {
    return this.loginUserUseCase.execute(dto);
  }

  @Get('validate')
  async validate(@Headers('authorization') authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const payload = this.jwtService.verify(token);
      return {
        valid: true,
        userId: payload.sub,
        email: payload.email,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
