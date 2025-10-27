import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AUTH_TOKEN_CONFIG, AuthTokenConfig } from '../token/token.constants';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @Inject(AUTH_TOKEN_CONFIG)
    private readonly tokenConfig: AuthTokenConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: tokenConfig.refresh.secret,
    });
  }

  async validate(payload: any) {
    return payload;
  }
}
