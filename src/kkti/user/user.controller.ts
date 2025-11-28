import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';

import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { UserService } from './user.service';
import { User } from './utils/user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':snsId')
  async getUser(@Param('snsId') snsId: string) {
    return this.userService.findBySnsId(snsId, 'kakao');
  }

  @UseGuards(AccessTokenGuard)
  @Delete('withdraw')
  async withdraw(@User() user: { userId: number }) {
    if (!user?.userId) {
      throw new HttpException(
        '잘못된 사용자 정보입니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const foundUser = await this.userService.findById(user.userId);
    if (!foundUser) {
      throw new HttpException('유저를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    if (foundUser.provider === 'kakao') {
      return this.userService.deleteKakaoUser(foundUser);
    }

    if (foundUser.provider === 'email') {
      return this.userService.deleteGeneralUser(foundUser.id);
    }

    throw new HttpException(
      '지원하지 않는 회원 유형입니다.',
      HttpStatus.BAD_REQUEST,
    );
  }

  @Get()
  async getAllUsers() {
    const users = await this.userService.findAllUsers();
    return {
      count: users.length,
      users,
    };
  }
}
