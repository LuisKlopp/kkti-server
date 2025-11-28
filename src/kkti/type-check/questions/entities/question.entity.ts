import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ database: 'kkti', name: 'questions_v2' })
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'display_order', type: 'int' })
  displayOrder: number;

  @Column({
    type: 'enum',
    enum: ['EI', 'SN', 'TF', 'JP'],
  })
  dimension: 'EI' | 'SN' | 'TF' | 'JP';

  @Column({ name: 'common_text', type: 'varchar', length: 100 })
  commonText: string;

  @Column({ name: 'option_a', type: 'varchar', length: 100 })
  optionA: string;

  @Column({ name: 'option_b', type: 'varchar', length: 100 })
  optionB: string;

  @Column({ type: 'tinyint', width: 4, default: 1 })
  weight: number;

  @Column({ type: 'int', nullable: true })
  order: number | null;
}
