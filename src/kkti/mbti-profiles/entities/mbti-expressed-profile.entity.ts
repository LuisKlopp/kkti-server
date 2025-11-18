import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('mbti_expressed_profiles')
@Unique(['mbti', 'expressedStyle'])
export class MbtiExpressedProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 4 })
  mbti: string;

  @Column({ length: 2, name: 'expressed_style' })
  expressedStyle: string;

  @Column({ length: 10 })
  title: string;

  @Column({ length: 45, name: 'description_title' })
  descriptionTitle: string;

  @Column({ type: 'text' })
  description: string;
}
