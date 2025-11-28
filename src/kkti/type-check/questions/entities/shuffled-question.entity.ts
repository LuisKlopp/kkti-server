import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Question } from './question.entity';

@Entity({ database: 'kkti', name: 'shuffled_questions_v2' })
export class ShuffledQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column({ name: 'option_a', type: 'varchar', length: 500 })
  optionA: string;

  @Column({ name: 'option_b', type: 'varchar', length: 500 })
  optionB: string;

  @Column({
    type: 'enum',
    enum: ['EI', 'SN', 'TF', 'JP'],
  })
  dimension: 'EI' | 'SN' | 'TF' | 'JP';

  @Column({ type: 'int' })
  order: number;

  @Column({ type: 'int', default: 2 })
  version: number;
}
