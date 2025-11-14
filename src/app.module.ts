import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './kkti/auth/auth.module';
import { CertificationModule } from './kkti/certification/certification.module';
import { MbtiProfilesModule } from './kkti/mbti-profiles/mbti-profiles.module';
import { AnswersModule } from './kkti/type-check/answers/answers.module';
import { QuestionsModule } from './kkti/type-check/questions/questions.module';
import { SessionsModule } from './kkti/type-check/sessions/sessions.module';
import { KktiUserModule } from './kkti/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: Number(configService.get('DB_PORT')),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        loggin: true,
        timezone: '+09:00',
      }),
    }),
    AuthModule,
    CertificationModule,
    AnswersModule,
    QuestionsModule,
    SessionsModule,
    KktiUserModule,
    MbtiProfilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
