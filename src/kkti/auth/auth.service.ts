import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';

import { SocialUserAfterAuth } from '../common/decorators/user.decorator';
import { CreateUserGeneralDto } from '../user/dto/create-user-general.dto';
import { UserService } from '../user/user.service';
import {
  ACCESS_TOKEN_JWT,
  REFRESH_TOKEN_JWT,
  RELAY_TOKEN_JWT,
} from './token/token.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserService,
    private readonly config: ConfigService,
    @Inject(ACCESS_TOKEN_JWT)
    private readonly accessTokenService: JwtService,
    @Inject(REFRESH_TOKEN_JWT)
    private readonly refreshTokenService: JwtService,
    @Inject(RELAY_TOKEN_JWT)
    private readonly relayTokenService: JwtService,
  ) {}
  async getMe(userId: number) {
    const user = await this.users.findById(userId, {
      relations: ['sessions'],
    });

    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다.');

    const { id, name, provider, email, sessions } = user;

    const latestSession = sessions?.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    )[0];

    return {
      id,
      name,
      provider,
      email,
      latestSession: latestSession
        ? {
            mbtiResult: latestSession.mbtiResult,
            expressedStyle: latestSession.expressedStyle,
            eRatio: latestSession.eRatio,
            iRatio: latestSession.iRatio,
            sRatio: latestSession.sRatio,
            nRatio: latestSession.nRatio,
            tRatio: latestSession.tRatio,
            fRatio: latestSession.fRatio,
            jRatio: latestSession.jRatio,
            pRatio: latestSession.pRatio,
            createdAt: latestSession.createdAt,
          }
        : null,
    };
  }

  async validateKakaoLogin(
    user: SocialUserAfterAuth,
    req: Request,
    res: Response,
  ) {
    const type = (req.query.state as string) || 'normal';
    const redirectBaseUrl =
      type === 'plain'
        ? this.config.get<string>('CLIENT_AFTER_LOGIN_PLAIN_URL')
        : this.config.get<string>('CLIENT_AFTER_LOGIN_URL');

    try {
      const { snsId, provider, email } = user;

      let existingUser = await this.users.findBySnsId(snsId, provider);

      if (!existingUser) {
        const userByEmail = await this.users.findByEmail(email);
        if (userByEmail && userByEmail.provider === 'email') {
          throw new BadRequestException(
            '해당 이메일은 일반 회원가입으로 이미 가입되어 있습니다. 일반 로그인을 이용해주세요.',
          );
        }

        existingUser = await this.users.createKakaoUser(user);
      }

      const { accessToken, refreshToken } = this.issueTokens(existingUser.id);

      const relayPayload = { accessToken, refreshToken };
      const relayToken = this.relayTokenService.sign(relayPayload);

      return res.redirect(`${redirectBaseUrl}?token=${relayToken}`);
    } catch (error) {
      const errorMessage = encodeURIComponent(
        error.message || '카카오 로그인 중 오류가 발생했습니다.',
      );
      return res.redirect(`${redirectBaseUrl}?error=${errorMessage}`);
    }
  }

  async validateEmailLogin(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('존재하지 않는 이메일입니다.');

    if (user.provider !== 'email') {
      throw new BadRequestException(
        '해당 이메일은 소셜 로그인을 통해 가입된 계정입니다. 카카오 로그인을 이용해주세요.',
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');

    const tokens = this.issueTokens(user.id);
    return { message: '이메일 로그인 성공', ...tokens, userId: user.id };
  }

  async registerUser(dto: CreateUserGeneralDto) {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      if (existing.provider === 'kakao') {
        throw new BadRequestException(
          '해당 이메일은 카카오로 이미 가입되어 있습니다. 카카오 로그인을 이용해주세요.',
        );
      }
      throw new BadRequestException('이미 존재하는 이메일입니다.');
    }

    const user = await this.users.createGeneralUser({
      ...dto,
      provider: 'email',
    });

    const { accessToken, refreshToken } = this.issueTokens(user.id);

    return {
      message: '회원가입 및 로그인 완료',
      userId: user.id,
      accessToken,
      refreshToken,
    };
  }

  async reissueAccessToken(userId: number) {
    return { accessToken: this.generateAccessToken(userId) };
  }

  private issueTokens(userId: number) {
    const accessToken = this.generateAccessToken(userId);
    const refreshToken = this.generateRefreshToken(userId);
    return { accessToken, refreshToken };
  }

  private generateAccessToken(userId: number) {
    return this.accessTokenService.sign({ sub: userId });
  }

  private generateRefreshToken(userId: number) {
    return this.refreshTokenService.sign({ sub: userId });
  }
}
