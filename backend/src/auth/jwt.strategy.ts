import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthUser } from '../common/decorators/current-user.decorator';

interface JwtPayload {
  sub: string;
  isGuest: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'dev-secret',
    });
  }

  // The return value is attached to the request as `req.user`.
  async validate(payload: JwtPayload): Promise<AuthUser> {
    return { userId: payload.sub, isGuest: payload.isGuest };
  }
}
