import { PartialType } from '@nestjs/mapped-types';

import { CreateUserKakaoDto } from './create-user-kakao.dto';

export class UpdateUserDto extends PartialType(CreateUserKakaoDto) {}
