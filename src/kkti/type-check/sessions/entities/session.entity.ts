import { Answer } from 'src/kkti/type-check/answers/entities/answer.entity';
import { User } from 'src/kkti/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'user_sessions', database: 'kkti' })
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.sessions, {
    onDelete: 'CASCADE', // 🔥 유저 삭제 시 세션도 자동 삭제
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'mbti_result', type: 'varchar', length: 4, nullable: true })
  mbtiResult: string;

  @Column({ name: 'expressed_style', nullable: true })
  expressedStyle: string;

  @OneToMany(() => Answer, (answer) => answer.session, { cascade: true })
  answers: Answer[];
}
