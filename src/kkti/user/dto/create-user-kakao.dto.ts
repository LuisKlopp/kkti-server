import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateUserKakaoDto {
  @IsString()
  snsId: string;

  @IsString()
  provider: 'kakao';

  @IsString()
  name: string;

  @IsIn(['MALE', 'FEMALE'])
  gender: 'MALE' | 'FEMALE';

  @IsString()
  birthYear: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
