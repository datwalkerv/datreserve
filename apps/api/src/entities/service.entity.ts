import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, Index
} from 'typeorm';
import { DurationUnit, Niche } from '@datreserve/shared-types';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  locationText: string;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ type: 'int' })
  durationValue: number;

  @Column({ type: 'enum', enum: DurationUnit, default: DurationUnit.MINUTES })
  durationUnit: DurationUnit;

  @Column({ type: 'enum', enum: Niche, nullable: true })
  iconKey: Niche;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
