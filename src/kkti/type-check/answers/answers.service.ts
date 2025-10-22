import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Answer } from './entities/answer.entity';

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(Answer)
    private readonly answersRepository: Repository<Answer>,
  ) {}

  async create(data: {
    sessionId: number;
    questionId: number;
    choice: 'A' | 'B';
  }): Promise<Answer> {
    const answer = this.answersRepository.create({
      session: { id: data.sessionId },
      question: { id: data.questionId },
      choice: data.choice,
    });
    return this.answersRepository.save(answer);
  }

  async findBySession(sessionId: number): Promise<Answer[]> {
    return this.answersRepository.find({
      where: { session: { id: sessionId } },
      order: { id: 'ASC' },
    });
  }
}
