import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('mbti_expressed_profiles')
@Unique(['mbti', 'expressed_style'])
export class MbtiExpressedProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10 })
  mbti: string;

  @Column({ length: 5 })
  expressed_style: string;

  @Column({ length: 255, nullable: true })
  title: string | null;

  @Column({ type: 'text' })
  description: string;
}
