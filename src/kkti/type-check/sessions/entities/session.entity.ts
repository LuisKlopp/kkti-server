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
    onDelete: 'CASCADE',
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

  @Column('tinyint', { name: 'e_ratio', unsigned: true, nullable: true })
  eRatio: number;

  @Column('tinyint', { name: 'i_ratio', unsigned: true, nullable: true })
  iRatio: number;

  @Column('tinyint', { name: 's_ratio', unsigned: true, nullable: true })
  sRatio: number;

  @Column('tinyint', { name: 'n_ratio', unsigned: true, nullable: true })
  nRatio: number;

  @Column('tinyint', { name: 't_ratio', unsigned: true, nullable: true })
  tRatio: number;

  @Column('tinyint', { name: 'f_ratio', unsigned: true, nullable: true })
  fRatio: number;

  @Column('tinyint', { name: 'j_ratio', unsigned: true, nullable: true })
  jRatio: number;

  @Column('tinyint', { name: 'p_ratio', unsigned: true, nullable: true })
  pRatio: number;

  @OneToMany(() => Answer, (answer) => answer.session, { cascade: true })
  answers: Answer[];
}
