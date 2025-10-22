import { Session } from 'src/kkti/type-check/sessions/entities/session.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users', database: 'kkti' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['kakao', 'email'] })
  provider: 'kakao' | 'email';

  @Column({ name: 'sns_id', nullable: true, unique: true })
  snsId?: string;

  @Column({ nullable: true, unique: true })
  email?: string;

  @Column({ nullable: true })
  password?: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ['MALE', 'FEMALE'] })
  gender?: 'MALE' | 'FEMALE';

  @Column({ name: 'birth_year', nullable: true })
  birthYear: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber?: string;

  @Column({ name: 'identity_verification_id', nullable: true })
  identityVerificationId?: string;

  @Column({ name: 'free_result', nullable: true })
  freeResult?: string;

  @Column({ name: 'free_expressed', nullable: true })
  freeExpressed?: string;

  @Column({ name: 'premium_result', nullable: true })
  premiumResult?: string;

  @Column({ name: 'premium_expressed', nullable: true })
  premiumExpressed?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];
}
