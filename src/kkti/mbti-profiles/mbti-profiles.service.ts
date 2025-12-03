import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MbtiExpressedProfile } from './entities/mbti-expressed-profile.entity';
import { MbtiMainProfile } from './entities/mbti-main-profile.entity';

@Injectable()
export class MbtiProfilesService {
  constructor(
    @InjectRepository(MbtiMainProfile)
    private readonly mainRepo: Repository<MbtiMainProfile>,

    @InjectRepository(MbtiExpressedProfile)
    private readonly expressedRepo: Repository<MbtiExpressedProfile>,
  ) {}

  async findMainProfile(mbti: string) {
    const data = await this.mainRepo.findOne({ where: { mbti } });
    if (!data)
      throw new NotFoundException(`Main MBTI profile not found: ${mbti}`);
    return data;
  }

  async findExpressedProfile(mbti: string, expressedStyle: string) {
    const data = await this.expressedRepo.findOne({
      where: { mbti, expressedStyle },
    });

    if (!data) {
      throw new NotFoundException(
        `Expressed MBTI profile not found: ${mbti}/${expressedStyle}`,
      );
    }
    return data;
  }

  async findAllMainProfiles(): Promise<MbtiMainProfile[]> {
    return this.mainRepo.find({
      order: { id: 'ASC' },
    });
  }

  async findAllExpressedProfiles() {
    return this.expressedRepo.find({
      order: { id: 'ASC' },
    });
  }
}
