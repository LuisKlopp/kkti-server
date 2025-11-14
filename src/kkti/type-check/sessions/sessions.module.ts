import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/kkti/auth/auth.module';
import { AccessTokenGuard } from 'src/kkti/auth/guards/access-token.guard';
import { MbtiProfilesModule } from 'src/kkti/mbti-profiles/mbti-profiles.module';
import { KktiUserModule } from 'src/kkti/user/user.module';

import { Session } from './entities/session.entity';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session]),
    KktiUserModule,
    AuthModule,
    MbtiProfilesModule,
  ],
  controllers: [SessionsController],
  providers: [SessionsService, AccessTokenGuard],
  exports: [SessionsService],
})
export class SessionsModule {}
