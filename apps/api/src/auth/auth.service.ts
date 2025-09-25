import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(email: string) {
    const payload = { sub: 'user_1', email, role: 'Agent' };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      refreshToken: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET ?? 'changeme',
        expiresIn: '7d'
      })
    };
  }

  async refresh(token: string) {
    const decoded = await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_REFRESH_SECRET ?? 'changeme'
    });
    return this.login(decoded.email);
  }
}
