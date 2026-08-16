import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index
} from 'typeorm';
import { Theme } from '@datreserve/shared-types';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  userId: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  companyName: string;

  @Column({ unique: true, nullable: true })
  @Index()
  slug: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  timezone: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  coverImageUrl: string;

  @Column({ nullable: true })
  niche: string;

  @Column({ default: false })
  hasLocation: boolean;

  @Column({ nullable: true })
  locationText: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  socials: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    website?: string;
  };

  @Column({ type: 'enum', enum: Theme, default: Theme.OBSIDIAN })
  theme: Theme;

  @Column({ default: 30 })
  bookingWindowDays: number;

  @Column({ default: 3 })
  bookingCutoffHours: number;

  @Column({ default: 0 })
  onboardingStage: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
