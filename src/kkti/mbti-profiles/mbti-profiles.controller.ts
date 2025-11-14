import { Controller, Get, Param } from '@nestjs/common';

import { MbtiProfilesService } from './mbti-profiles.service';

@Controller('mbti-profiles')
export class MbtiProfilesController {
  constructor(private readonly mbtiProfilesService: MbtiProfilesService) {}

  @Get('main/:mbti')
  async getMain(@Param('mbti') mbti: string) {
    return this.mbtiProfilesService.findMainProfile(mbti.toUpperCase());
  }

  @Get('expressed/:mbti/:style')
  async getExpressed(
    @Param('mbti') mbti: string,
    @Param('style') style: string,
  ) {
    return this.mbtiProfilesService.findExpressedProfile(
      mbti.toUpperCase(),
      style.toUpperCase(),
    );
  }
}
