import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { KktiUserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { KakaoStrategy } from './strategies/kakao.strategy';
import {
  ACCESS_TOKEN_JWT,
  AUTH_TOKEN_CONFIG,
  AuthTokenConfig,
  REFRESH_TOKEN_JWT,
  RELAY_TOKEN_JWT,
} from './token/token.constants';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    KktiUserModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    KakaoStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    AccessTokenGuard,
    RefreshTokenGuard,
    {
      provide: AUTH_TOKEN_CONFIG,
      useFactory: (configService: ConfigService): AuthTokenConfig => {
        const accessSecret = configService.get<string>('JWT_ACCESS_SECRET');
        const refreshSecret = configService.get<string>('JWT_REFRESH_SECRET');
        const relaySecret = configService.get<string>('JWT_RELAY_SECRET');

        if (!accessSecret) {
          throw new Error('JWT_ACCESS_SECRET is not configured');
        }
        if (!refreshSecret) {
          throw new Error('JWT_REFRESH_SECRET is not configured');
        }
        if (!relaySecret) {
          throw new Error('JWT_RELAY_SECRET is not configured');
        }

        return {
          access: {
            secret: accessSecret,
            expiresIn:
              configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '5h',
          },
          refresh: {
            secret: refreshSecret,
            expiresIn:
              configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
          },
          relay: {
            secret: relaySecret,
            expiresIn:
              configService.get<string>('JWT_RELAY_EXPIRES_IN') ?? '1m',
          },
        };
      },
      inject: [ConfigService],
    },
    {
      provide: ACCESS_TOKEN_JWT,
      useFactory: (tokenConfig: AuthTokenConfig) =>
        new JwtService({
          secret: tokenConfig.access.secret,
          signOptions: { expiresIn: tokenConfig.access.expiresIn as any },
        }),
      inject: [AUTH_TOKEN_CONFIG],
    },
    {
      provide: REFRESH_TOKEN_JWT,
      useFactory: (tokenConfig: AuthTokenConfig) =>
        new JwtService({
          secret: tokenConfig.refresh.secret,
          signOptions: { expiresIn: tokenConfig.refresh.expiresIn as any },
        }),
      inject: [AUTH_TOKEN_CONFIG],
    },
    {
      provide: RELAY_TOKEN_JWT,
      useFactory: (tokenConfig: AuthTokenConfig) =>
        new JwtService({
          secret: tokenConfig.relay.secret,
          signOptions: { expiresIn: tokenConfig.relay.expiresIn as any },
        }),
      inject: [AUTH_TOKEN_CONFIG],
    },
  ],
  exports: [
    AuthService,
    AccessTokenGuard,
    RefreshTokenGuard,
    AUTH_TOKEN_CONFIG,
    ACCESS_TOKEN_JWT,
    REFRESH_TOKEN_JWT,
    RELAY_TOKEN_JWT,
  ],
})
export class AuthModule {}
