import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { FarmersService } from '../../farmers/farmers.service';

@Injectable()
export class FarmerJwtStrategy extends PassportStrategy(Strategy, 'jwt-farmer') {
  constructor(
    config: ConfigService,
    private farmersService: FarmersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET') as string,
      ignoreExpiration: false,
    });
  }

  async validate(payload: { sub: string; mobile: string; type: string }) {
    if (payload.type !== 'farmer') return null;
    const farmer = await this.farmersService.findByIdOrNull(payload.sub);
    if (!farmer) return null;
    return { ...farmer, type: 'farmer' as const };
  }
}
