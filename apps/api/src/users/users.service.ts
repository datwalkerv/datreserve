import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '../entities/user-profile.entity';
import { WorkingHours } from '../entities/working-hours.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly profileRepo: Repository<UserProfile>,
    @InjectRepository(WorkingHours)
    private readonly hoursRepo: Repository<WorkingHours>,
  ) {}

  async findByUserId(userId: string): Promise<UserProfile | null> {
    return this.profileRepo.findOne({ where: { userId } });
  }

  async findBySlug(slug: string): Promise<UserProfile | null> {
    return this.profileRepo.findOne({ where: { slug } });
  }

  async createProfile(userId: string): Promise<UserProfile> {
    const profile = this.profileRepo.create({ userId, onboardingStage: 0 });
    return this.profileRepo.save(profile);
  }

  async updateOnboardingStage(userId: string, stage: number, data: Partial<UserProfile>): Promise<UserProfile> {
    let profile = await this.findByUserId(userId);
    if (!profile) {
      profile = await this.createProfile(userId);
    }
    Object.assign(profile, data, { onboardingStage: stage });
    return this.profileRepo.save(profile);
  }

  async getWorkingHours(userId: string): Promise<WorkingHours[]> {
    return this.hoursRepo.find({ where: { userId } });
  }

  async upsertWorkingHours(userId: string, hours: Partial<WorkingHours>[]): Promise<WorkingHours[]> {
    await this.hoursRepo.delete({ userId });
    const entities = hours.map(h => this.hoursRepo.create({ ...h, userId }));
    return this.hoursRepo.save(entities);
  }
}
