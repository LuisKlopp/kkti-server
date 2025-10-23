import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { SocialUserAfterAuth } from '../common/decorators/user.decorator';
import { CreateUserGeneralDto } from '../user/dto/create-user-general.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserService,
    private readonly jwt: JwtService,
  ) {}

  async getMe(userId: number) {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다.');

    const {
      id,
      name,
      provider,
      email,
      freeResult,
      freeExpressed,
      premiumResult,
      premiumExpressed,
    } = user;
    return {
      id,
      name,
      provider,
      email,
      freeResult,
      freeExpressed,
      premiumResult,
      premiumExpressed,
    };
  }

  async validateKakaoLogin(user: SocialUserAfterAuth) {
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

    const tokens = await this.issueTokens(existingUser.id);

    return {
      message: '카카오 로그인 성공',
      ...tokens,
      userId: existingUser.id,
    };
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

    const tokens = await this.issueTokens(user.id);
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

    const { accessToken, refreshToken } = await this.issueTokens(user.id);

    return {
      message: '회원가입 및 로그인 완료',
      userId: user.id,
      accessToken,
      refreshToken,
    };
  }

  async reissueAccessToken(userId: number) {
    return { accessToken: await this.generateAccessToken(userId) };
  }

  private async issueTokens(userId: number) {
    const accessToken = await this.generateAccessToken(userId);
    const refreshToken = this.generateRefreshToken(userId);
    return { accessToken, refreshToken };
  }

  private async generateAccessToken(userId: number) {
    return this.jwt.sign(
      { sub: userId },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '10s' },
    );
  }

  private generateRefreshToken(userId: number) {
    return this.jwt.sign(
      { sub: userId },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
    );
  }
}
