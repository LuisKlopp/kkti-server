import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { SocialUserAfterAuth } from 'src/kkti/common/decorators/user.decorator';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor() {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      callbackURL: process.env.KAKAO_CALLBACK_URL,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: any, user?: SocialUserAfterAuth) => void,
  ) {
    const { id, _json } = profile;

    const user: SocialUserAfterAuth = {
      snsId: id,
      provider: 'kakao',
      email: _json.kakao_account?.email,
      name: _json.kakao_account?.name || _json.properties?.nickname || '',
      gender:
        _json.kakao_account?.gender === 'male' ||
        _json.kakao_account?.gender === 'female'
          ? _json.kakao_account.gender
          : 'male',
      birthYear: _json.kakao_account?.birthyear || '',
      phoneNumber: _json.kakao_account?.phone_number || '',
    };

    done(null, user);
  }
}
