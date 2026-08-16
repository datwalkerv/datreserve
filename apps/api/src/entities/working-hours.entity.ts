import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('working_hours')
export class WorkingHours {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column({ type: 'smallint' })
  weekday: number;

  @Column({ default: false })
  isOpen: boolean;

  @Column({ nullable: true })
  startTime: string;

  @Column({ nullable: true })
  endTime: string;

  @Column({ default: 30 })
  slotIntervalMinutes: number;
}
