import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { IJwtService, JwtPayload } from '../../../domain/user/services/jwt.service.interface';

@Injectable()
export class JwtServiceImpl implements IJwtService {
  constructor(private readonly jwtService: NestJwtService) {}

  sign(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }

  verify(token: string): JwtPayload {
    return this.jwtService.verify(token);
  }
}
