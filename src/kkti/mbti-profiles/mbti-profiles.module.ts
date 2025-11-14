import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MbtiExpressedProfile } from './entities/mbti-expressed-profile.entity';
import { MbtiMainProfile } from './entities/mbti-main-profile.entity';
import { MbtiProfilesController } from './mbti-profiles.controller';
import { MbtiProfilesService } from './mbti-profiles.service';

@Module({
  imports: [TypeOrmModule.forFeature([MbtiMainProfile, MbtiExpressedProfile])],
  providers: [MbtiProfilesService],
  controllers: [MbtiProfilesController],
  exports: [MbtiProfilesService],
})
export class MbtiProfilesModule {}
