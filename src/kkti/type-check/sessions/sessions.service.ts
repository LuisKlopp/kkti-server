import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { MbtiExpressedProfile } from 'src/kkti/mbti-profiles/entities/mbti-expressed-profile.entity';
import { MbtiMainProfile } from 'src/kkti/mbti-profiles/entities/mbti-main-profile.entity';
import { MbtiProfilesService } from 'src/kkti/mbti-profiles/mbti-profiles.service';
import { UserService } from 'src/kkti/user/user.service';
import { DataSource, Repository } from 'typeorm';

import {
  applyTieBreak,
  calculateExpressedStyle,
  calculateMbtiByWinners,
  calculateMbtiRatios,
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
    private readonly mbtiProfiles: MbtiProfilesService,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
  ) {}

  async createWithAnswers(
    userId: number,
    answers: CreateSessionWithAnswersDto['answers'],
  ): Promise<Session> {
    const session = this.sessionsRepository.create({
      userId,
      shareUuid: randomUUID(),
      answers: answers.map((ans) =>
        Object.assign(new Answer(), {
          question: { id: ans.questionId },
          choice: ans.choice,
        }),
      ),
    });

    return this.sessionsRepository.save(session);
  }

  async calculateMbtiResult(sessionId: number) {
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

        const tieData: Record<
          'EI' | 'SN' | 'TF' | 'JP',
          {
            heavyA: number;
            heavyB: number;
            countA: number;
            countB: number;
            lastChoice: 'A' | 'B';
          }
        > = {
          EI: { heavyA: 0, heavyB: 0, countA: 0, countB: 0, lastChoice: 'A' },
          SN: { heavyA: 0, heavyB: 0, countA: 0, countB: 0, lastChoice: 'A' },
          TF: { heavyA: 0, heavyB: 0, countA: 0, countB: 0, lastChoice: 'A' },
          JP: { heavyA: 0, heavyB: 0, countA: 0, countB: 0, lastChoice: 'A' },
        };

        session.answers.forEach((ans) => {
          const { dimension, weight = 1 } = ans.question;
          const isA = ans.choice === 'A';

          const dim = dimension as keyof typeof tieData;
          const data = tieData[dim];

          isA ? data.countA++ : data.countB++;
          if (weight === 2) isA ? data.heavyA++ : data.heavyB++;
          data.lastChoice = isA ? 'A' : 'B';

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

        // tie-break 승자 (점수에 더하지 않음)
        const winners = {
          EI: applyTieBreak({ A: scores.EI.E, B: scores.EI.I }, tieData.EI),
          SN: applyTieBreak({ A: scores.SN.S, B: scores.SN.N }, tieData.SN),
          TF: applyTieBreak({ A: scores.TF.T, B: scores.TF.F }, tieData.TF),
          JP: applyTieBreak({ A: scores.JP.J, B: scores.JP.P }, tieData.JP),
        };

        const mbti = calculateMbtiByWinners(winners);
        const expressedStyle = calculateExpressedStyle(scores);
        const ratios = calculateMbtiRatios(scores);

        Object.assign(session, {
          mbtiResult: mbti,
          expressedStyle,
          ...ratios,
        });

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

    return { mbti, expressedStyle };
  }

  async findById(id: number): Promise<Session | null> {
    return this.sessionsRepository.findOne({ where: { id } });
  }

  async findByShareUuid(shareUuid: string): Promise<
    Partial<Session> & {
      mainProfile: MbtiMainProfile;
      expressedProfile: MbtiExpressedProfile;
    }
  > {
    const session = await this.sessionsRepository.findOne({
      where: { shareUuid },
    });

    const { mbtiResult, expressedStyle } = session;

    const mainProfile = await this.mbtiProfiles.findMainProfile(mbtiResult);
    const expressedProfile = await this.mbtiProfiles.findExpressedProfile(
      mbtiResult,
      expressedStyle,
    );

    if (!session) {
      throw new NotFoundException('해당 공유 결과를 찾을 수 없습니다.');
    }

    const {
      id: _id,
      userId: _userId,
      answers: _answers,
      ...publicData
    } = session;

    return {
      ...publicData,
      mainProfile,
      expressedProfile,
    };
  }

  async findAllByUser(userId: number) {
    return this.sessionsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      select: ['id', 'mbtiResult', 'expressedStyle', 'createdAt'],
    });
  }
}
