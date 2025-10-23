import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
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
  constructor(private readonly authService: AuthService) {}

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
    return this.authService.validateKakaoLogin(user, req, res);
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
