import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';

import {
  SocialUser,
  SocialUserAfterAuth,
} from '../common/decorators/user.decorator';
import { CreateUserGeneralDto } from '../user/dto/create-user-general.dto';
import { AuthService } from './auth.service';
import { AccessTokenGuard } from './guards/access-token.guard';
import { KakaoAuthGuard } from './guards/kakao-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { GetCurrentUserId } from './utils/get-current-user';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  @Get('kakao')
  @UseGuards(KakaoAuthGuard)
  kakaoLogin() {}

  @UseGuards(KakaoAuthGuard)
  @Get('kakao/callback')
  async kakaoCallback(
    @SocialUser() user: SocialUserAfterAuth,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.validateKakaoLogin(user);

    const type = (req.query.state as string) || 'normal';
    const redirectBaseUrl =
      type === 'plain'
        ? this.config.get<string>('CLIENT_AFTER_LOGIN_PLAIN_URL')
        : this.config.get<string>('CLIENT_AFTER_LOGIN_URL');

    const jwtPayload = { accessToken, refreshToken };
    const jwtToken = this.jwt.sign(jwtPayload, {
      secret: this.config.get('JWT_RELAY_SECRET'),
      expiresIn: '3m',
    });

    return res.redirect(`${redirectBaseUrl}?token=${jwtToken}`);
  }

  @Post('login')
  async emailLogin(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.validateEmailLogin(email, password);
  }

  @Post('sign-up')
  async signUp(@Body() dto: CreateUserGeneralDto) {
    return this.authService.registerUser(dto);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refreshAccessToken(
    @GetCurrentUserId() userId: number,
  ): Promise<{ accessToken: string }> {
    return this.authService.reissueAccessToken(userId);
  }

  @UseGuards(AccessTokenGuard)
  @Get('me')
  async getMe(@GetCurrentUserId() userId: number) {
    return this.authService.getMe(userId);
  }
}
