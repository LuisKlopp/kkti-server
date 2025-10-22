import { Question } from 'src/kkti/type-check/questions/entities/question.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Session } from '../../sessions/entities/session.entity';

@Entity({ name: 'user_answers', database: 'kkti' })
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Session, (session) => session.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column({ type: 'enum', enum: ['A', 'B'] })
  choice: 'A' | 'B';
}
