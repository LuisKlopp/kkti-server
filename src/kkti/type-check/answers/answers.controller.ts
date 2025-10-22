import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { AnswersService } from './answers.service';
import { Answer } from './entities/answer.entity';

@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Post()
  async create(
    @Body()
    body: {
      sessionId: number;
      questionId: number;
      choice: 'A' | 'B';
    },
  ): Promise<Answer> {
    return this.answersService.create(body);
  }

  @Get('session/:sessionId')
  async findBySession(
    @Param('sessionId') sessionId: number,
  ): Promise<Answer[]> {
    return this.answersService.findBySession(sessionId);
  }
}
