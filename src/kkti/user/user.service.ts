import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as bcrypt from 'bcrypt';
import { FindOneOptions, In, Like, Repository } from 'typeorm';

import { Session } from '../type-check/sessions/entities/session.entity';
import { CreateUserGeneralDto } from './dto/create-user-general.dto';
import { CreateUserKakaoDto } from './dto/create-user-kakao.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,

    private readonly configService: ConfigService,
  ) {}

  async findBySnsId(snsId: string, provider: 'kakao'): Promise<User | null> {
    return this.userRepository.findOneBy({ snsId, provider });
  }

  async findById(id: number, options?: FindOneOptions<User>) {
    return this.userRepository.findOne({
      where: { id },
      ...options,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async createGeneralUser(dto: CreateUserGeneralDto): Promise<User> {
    const { password, birth, ...rest } = dto;

    const hashedPassword = await bcrypt.hash(password, 10);
    const birthYear = birth.split('-')[0];

    const user = this.userRepository.create({
      ...rest,
      password: hashedPassword,
      provider: 'email',
      birthYear,
    });

    return this.userRepository.save(user);
  }

  async createKakaoUser(dto: CreateUserKakaoDto): Promise<User> {
    const user = this.userRepository.create({
      ...dto,
      provider: 'kakao',
    });
    return this.userRepository.save(user);
  }

  async deleteKakaoUser(user: User) {
    const adminKey = this.configService.get<string>('KAKAO_ADMIN_KEY');

    try {
      const params = new URLSearchParams();
      params.append('target_id_type', 'user_id');
      params.append('target_id', user.snsId);

      const response = await axios.post(
        'https://kapi.kakao.com/v1/user/unlink',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            Authorization: `KakaoAK ${adminKey}`,
          },
        },
      );

      await this.userRepository.delete({ id: user.id });

      return {
        success: true,
        kakaoUnlinkedId: response.data.id,
      };
    } catch (error) {
      console.error(
        '카카오 연결 해제 실패:',
        error.response?.data || error.message,
      );
    }
  }

  async deleteGeneralUser(userId: number) {
    const existingUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    await this.userRepository.delete({ id: userId });

    return {
      success: true,
      message: '이메일 회원 탈퇴가 완료되었습니다.',
      deletedUserId: userId,
    };
  }

  async findUsers({
    page,
    limit,
    search,
  }: {
    page: number;
    limit: number;
    search?: string;
  }) {
    const where = search
      ? [{ name: Like(`%${search}%`) }, { email: Like(`%${search}%`) }]
      : undefined;

    const [users, total] = await this.userRepository.findAndCount({
      select: [
        'id',
        'email',
        'name',
        'gender',
        'phoneNumber',
        'birthYear',
        'createdAt',
        'isTest',
        'consultingMbti',
        'consultingDate',
      ],
      where,
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    const userIds = users.map((u) => u.id);

    if (userIds.length === 0) {
      return { total, page, limit, users };
    }

    const sessions = await this.sessionsRepository.find({
      where: { userId: In(userIds) },
      select: ['userId', 'mbtiResult'],
      order: { createdAt: 'DESC' },
    });

    const sessionMap = new Map<number, any[]>();

    sessions.forEach((s) => {
      if (!sessionMap.has(s.userId)) {
        sessionMap.set(s.userId, []);
      }
      sessionMap.get(s.userId)!.push(s);
    });

    const usersWithHistory = users.map((u) => ({
      ...u,
      sessions: sessionMap.get(u.id) ?? [],
    }));

    return {
      total,
      page,
      limit,
      users: usersWithHistory,
    };
  }

  async updateConsulting(
    id: number,
    data: { consultingMbti: string; consultingDate: string },
  ) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다.');

    user.consultingMbti = data.consultingMbti;
    user.consultingDate = data.consultingDate;

    await this.userRepository.save(user);

    return {
      message: '컨설팅 정보가 저장되었습니다.',
      user,
    };
  }

  async getUserHistory(userId: number) {
    const rawUser = await this.userRepository.findOne({
      where: { id: userId },
      select: ['consultingMbti'],
    });

    const sessions = await this.sessionsRepository.find({
      where: { userId },
      select: ['mbtiResult', 'createdAt'],
      order: { createdAt: 'DESC' },
    });

    return {
      user: {
        consultingMbti: rawUser?.consultingMbti ?? null,
      },
      sessions,
    };
  }
}
