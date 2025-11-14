import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('mbti_main_profiles')
@Unique(['mbti'])
export class MbtiMainProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10 })
  mbti: string;

  @Column({ length: 45 })
  animals: string;

  @Column({ type: 'text' })
  overview: string;

  @Column({ type: 'simple-json', nullable: true })
  strengths: string[];

  @Column({ type: 'simple-json', nullable: true })
  love_style: string[];

  @Column({ type: 'simple-json', nullable: true })
  growth_points: string[];
}
