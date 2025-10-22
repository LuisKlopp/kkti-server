import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Question } from './question.entity';

@Entity({ database: 'kkti', name: 'shuffled_questions' })
export class ShuffledQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column({ type: 'text', name: 'option_a' })
  optionA: string;

  @Column({ type: 'text', name: 'option_b' })
  optionB: string;

  @Column({
    type: 'enum',
    enum: ['EI', 'SN', 'TF', 'JP'],
  })
  dimension: 'EI' | 'SN' | 'TF' | 'JP';

  @Column()
  order: number;

  @Column()
  version: number;
}
