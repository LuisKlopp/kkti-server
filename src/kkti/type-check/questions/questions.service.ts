import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Question } from './entities/question.entity';
import { ShuffledQuestion } from './entities/shuffled-question.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,

    @InjectRepository(ShuffledQuestion)
    private readonly shuffledQuestionsRepository: Repository<ShuffledQuestion>,
  ) {}

  async findAll(): Promise<Question[]> {
    return this.questionsRepository.find({
      order: { dimension: 'ASC', order: 'ASC' },
    });
  }

  async findShuffled(): Promise<any[]> {
    return this.shuffledQuestionsRepository
      .createQueryBuilder('shuffled')
      .leftJoinAndSelect('shuffled.question', 'question')
      .select([
        'question.id AS id',
        'question.optionA AS optionA',
        'question.optionB AS optionB',
        'question.commonText AS commonText',
        'question.dimension AS dimension',
        'question.`order` AS `order`',
        'question.weight AS weight',
      ])
      .orderBy('shuffled.id', 'ASC')
      .getRawMany();
  }
}
