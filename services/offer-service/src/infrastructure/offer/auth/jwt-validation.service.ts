import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { UnauthorizedException } from '../../../domain/exceptions/domain.exception';

export interface ValidateTokenResponse {
  valid: boolean;
  userId?: string;
}

@Injectable()
export class JwtValidationService {
  private readonly userServiceUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {
    this.userServiceUrl = this.configService.get<string>('USER_SERVICE_URL');
    if (!this.userServiceUrl) {
      throw new Error('USER_SERVICE_URL environment variable is not set');
    }
  }

  async validateToken(token: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<ValidateTokenResponse>(`${this.userServiceUrl}/auth/validate`, {
          headers: {
            Authorization: token,
          },
        })
      );

      if (!response.data.valid || !response.data.userId) {
        throw new UnauthorizedException('Invalid token');
      }

      return response.data.userId;
    } catch {
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
