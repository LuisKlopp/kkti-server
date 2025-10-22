import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ database: 'kkti', name: 'questions' })
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['EI', 'SN', 'TF', 'JP'] })
  dimension: 'EI' | 'SN' | 'TF' | 'JP';

  @Column({ name: 'common_text', type: 'varchar', length: 45 })
  commonText: string;

  @Column({ type: 'text', name: 'option_a' })
  optionA: string;

  @Column({ type: 'text', name: 'option_b' })
  optionB: string;

  @Column({ type: 'tinyint', width: 4, default: 1 })
  weight: number;

  @Column('int')
  order: number;
}
