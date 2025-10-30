import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/kkti/auth/guards/access-token.guard';
import { GetCurrentUserId } from 'src/kkti/auth/utils/get-current-user';

import { CreateSessionWithAnswersDto } from './dto/create-session-with-answers.dto';
import { Session } from './entities/session.entity';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  async createSessionWithAnswers(
    @GetCurrentUserId() userId: number,
    @Body() dto: CreateSessionWithAnswersDto,
  ) {
    return this.sessionsService.createSessionAndReturnResult(
      userId,
      dto.answers,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Session | null> {
    return this.sessionsService.findById(id);
  }

  @Get('share/:shareUuid')
  async findByShareUuid(
    @Param('shareUuid') shareUuid: string,
  ): Promise<Partial<Session> | null> {
    return this.sessionsService.findByShareUuid(shareUuid);
  }
}
