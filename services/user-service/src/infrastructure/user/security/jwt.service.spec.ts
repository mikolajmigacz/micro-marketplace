import { Test, TestingModule } from '@nestjs/testing';
import { JwtServiceImpl } from './jwt.service';
import { JwtService } from '@nestjs/jwt';

describe('JwtServiceImpl', () => {
  let service: JwtServiceImpl;
  let mockJwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    mockJwtService = {
      sign: jest.fn().mockReturnValue('jwt_token'),
      verify: jest.fn().mockReturnValue({ sub: '123', email: 'user@example.com' }),
    } as unknown as jest.Mocked<JwtService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtServiceImpl, { provide: JwtService, useValue: mockJwtService }],
    }).compile();

    service = module.get<JwtServiceImpl>(JwtServiceImpl);
  });

  describe('sign', () => {
    it('should sign JWT token with payload', () => {
      const payload = { sub: '123', email: 'user@example.com' };

      const token = service.sign(payload);

      expect(token).toBe('jwt_token');
      expect(mockJwtService.sign).toHaveBeenCalledWith(payload);
    });
  });

  describe('verify', () => {
    it('should verify JWT token', () => {
      const token = 'jwt_token';

      const payload = service.verify(token);

      expect(payload).toEqual({ sub: '123', email: 'user@example.com' });
      expect(mockJwtService.verify).toHaveBeenCalledWith(token);
    });
  });
});
