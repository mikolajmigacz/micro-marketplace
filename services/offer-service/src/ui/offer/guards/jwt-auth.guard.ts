import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtValidationService } from '../../../infrastructure/offer/auth/jwt-validation.service';
import { UnauthorizedException } from '../../../domain/exceptions/domain.exception';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtValidationService: JwtValidationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const userId = await this.jwtValidationService.validateToken(authHeader);
    request.user = { userId };

    return true;
  }
}
