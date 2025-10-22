import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/kkti/user/user.service';
import { DataSource, Repository } from 'typeorm';

import {
  calculateExpressedStyle,
  calculateMbti,
  // logMbtiDebug,
} from '../../utils/mbti-utils';
import { getSessionMutex } from '../../utils/mutex';
import { Answer } from '../answers/entities/answer.entity';
import { CreateSessionWithAnswersDto } from './dto/create-session-with-answers.dto';
import { Session } from './entities/session.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
  ) {}

  async createWithAnswers(
    userId: number,
    answers: CreateSessionWithAnswersDto['answers'],
  ): Promise<Session> {
    const session = this.sessionsRepository.create({
      userId,
      answers: answers.map((ans) =>
        Object.assign(new Answer(), {
          question: { id: ans.questionId },
          choice: ans.choice,
        }),
      ),
    });

    return this.sessionsRepository.save(session);
  }

  async calculateMbtiResult(
    sessionId: number,
  ): Promise<{ mbti: string; expressedStyle: string }> {
    const mutex = getSessionMutex(sessionId);
    return await mutex.runExclusive(async () => {
      return await this.dataSource.transaction(async (manager) => {
        const session = await manager.findOne(Session, {
          where: { id: sessionId },
          relations: ['answers', 'answers.question'],
        });

        if (!session) throw new NotFoundException('Session not found');
        if (session.mbtiResult && session.expressedStyle) {
          return {
            mbti: session.mbtiResult,
            expressedStyle: session.expressedStyle,
          };
        }

        const scores = {
          EI: { E: 0, I: 0 },
          SN: { S: 0, N: 0 },
          TF: { T: 0, F: 0 },
          JP: { J: 0, P: 0 },
        };

        session.answers.forEach((ans) => {
          const { dimension, weight = 1 } = ans.question;
          const isA = ans.choice === 'A';

          switch (dimension) {
            case 'EI':
              isA ? (scores.EI.E += weight) : (scores.EI.I += weight);
              break;
            case 'SN':
              isA ? (scores.SN.S += weight) : (scores.SN.N += weight);
              break;
            case 'TF':
              isA ? (scores.TF.T += weight) : (scores.TF.F += weight);
              break;
            case 'JP':
              isA ? (scores.JP.J += weight) : (scores.JP.P += weight);
              break;
          }
        });

        const mbti = calculateMbti(scores);
        const expressedStyle = calculateExpressedStyle(scores);

        // logMbtiDebug(scores, mbti, expressedStyle);

        session.mbtiResult = mbti;
        session.expressedStyle = expressedStyle;

        await manager.save(session);

        return { mbti, expressedStyle };
      });
    });
  }

  async createSessionAndReturnResult(
    userId: number,
    answers: CreateSessionWithAnswersDto['answers'],
  ): Promise<{ mbti: string; expressedStyle: string }> {
    const session = await this.createWithAnswers(userId, answers);

    const { mbti, expressedStyle } = await this.calculateMbtiResult(session.id);

    await this.userService.updateFreeResult(userId, mbti, expressedStyle);

    return { mbti, expressedStyle };
  }

  async findById(id: number): Promise<Session | null> {
    return this.sessionsRepository.findOne({ where: { id } });
  }
}
