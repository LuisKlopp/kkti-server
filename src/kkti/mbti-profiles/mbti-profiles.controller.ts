import { Controller, Get, Param } from '@nestjs/common';

import { MbtiMainProfile } from './entities/mbti-main-profile.entity';
import { MbtiProfilesService } from './mbti-profiles.service';

@Controller('mbti-profiles')
export class MbtiProfilesController {
  constructor(private readonly mbtiProfilesService: MbtiProfilesService) {}

  @Get('main/:mbti')
  async getMain(@Param('mbti') mbti: string) {
    return this.mbtiProfilesService.findMainProfile(mbti.toUpperCase());
  }

  @Get('main')
  async findAllMainProfiles(): Promise<MbtiMainProfile[]> {
    return this.mbtiProfilesService.findAllMainProfiles();
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

  @Get('expressed')
  findAll() {
    return this.mbtiProfilesService.findAllExpressedProfiles();
  }
}
