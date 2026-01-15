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

  @Column({ length: 50 })
  nickname: string;

  @Column({ type: 'text' })
  overview: string;

  @Column({ type: 'text' })
  strengths: string;

  @Column({ type: 'text', name: 'love_style' })
  loveStyle: string;

  @Column({ type: 'text' })
  celebrities: string;

  @Column({ type: 'text', name: 'love_matches' })
  loveMatches: string;

  @Column({ type: 'text', name: 'resembled_animal' })
  resembledAnimal: string;

  @Column({ type: 'text', name: 'growth_points' })
  growthPoints: string;
}
