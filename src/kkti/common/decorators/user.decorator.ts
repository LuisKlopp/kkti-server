import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const SocialUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
export interface SocialUserAfterAuth {
  snsId: string;
  provider: 'kakao';
  email: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  birthYear: string;
  phoneNumber?: string;
}
