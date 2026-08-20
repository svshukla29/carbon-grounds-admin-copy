import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET') as string,
      ignoreExpiration: false,
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    // Must return null (not throw) on a miss: this strategy runs as part of
    // AuthGuard(['jwt', 'jwt-farmer']) on shared endpoints, and a thrown
    // NotFoundException here aborts the whole chain before 'jwt-farmer' ever
    // gets a chance to validate a farmer token against the same endpoint.
    return this.usersService.findByIdOrNull(payload.sub);
  }
}
