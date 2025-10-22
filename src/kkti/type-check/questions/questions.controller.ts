import { Controller, Get } from '@nestjs/common';

import { Question } from './entities/question.entity';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  async getAllQuestions(): Promise<Question[]> {
    return this.questionsService.findAll();
  }

  @Get('/shuffled')
  async getShuffledQuestions() {
    return this.questionsService.findShuffled();
  }
}
