import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '../entities/user-profile.entity';
import { WorkingHours } from '../entities/working-hours.entity';

const COUNTRY_TZ: Record<string, string> = {
  US: 'America/New_York', GB: 'Europe/London', DE: 'Europe/Berlin',
  FR: 'Europe/Paris', HU: 'Europe/Budapest', RO: 'Europe/Bucharest',
  PL: 'Europe/Warsaw', IT: 'Europe/Rome', ES: 'Europe/Madrid',
  NL: 'Europe/Amsterdam', BE: 'Europe/Brussels', AT: 'Europe/Vienna',
  CH: 'Europe/Zurich', SE: 'Europe/Stockholm', NO: 'Europe/Oslo',
  DK: 'Europe/Copenhagen', FI: 'Europe/Helsinki', PT: 'Europe/Lisbon',
  GR: 'Europe/Athens', CZ: 'Europe/Prague', SK: 'Europe/Bratislava',
  HR: 'Europe/Zagreb', RS: 'Europe/Belgrade', UA: 'Europe/Kyiv',
  TR: 'Europe/Istanbul', CA: 'America/Toronto', AU: 'Australia/Sydney',
  NZ: 'Pacific/Auckland', AE: 'Asia/Dubai', SG: 'Asia/Singapore',
};

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
    await this.profileRepo.save(profile);
    const defaultHours = [1, 2, 3, 4, 5].map(weekday =>
      this.hoursRepo.create({ userId, weekday, isOpen: true, startTime: '09:00', endTime: '15:00', slotIntervalMinutes: 30 }),
    );
    await this.hoursRepo.save(defaultHours);
    return profile;
  }

  async updateOnboardingStage(userId: string, stage: number, data: Partial<UserProfile>): Promise<UserProfile> {
    let profile = await this.findByUserId(userId);
    if (!profile) {
      profile = await this.createProfile(userId);
    }
    const tzFromCountry = (data as any).country ? COUNTRY_TZ[(data as any).country] : undefined;
    Object.assign(profile, data, { onboardingStage: stage, ...(tzFromCountry ? { timezone: tzFromCountry } : {}) });
    return this.profileRepo.save(profile);
  }

  async getWorkingHours(userId: string): Promise<WorkingHours[]> {
    return this.hoursRepo.find({ where: { userId } });
  }

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const allowed = ['firstName','lastName','companyName','phoneNumber','description','currency','locationText','hasLocation','socials','theme'];
    const update: Partial<UserProfile> = {};
    for (const key of allowed) {
      if (key in data) (update as any)[key] = (data as any)[key];
    }
    await this.profileRepo.update({ userId }, update);
    return this.findByUserId(userId);
  }

  async upsertWorkingHours(userId: string, hours: Partial<WorkingHours>[]): Promise<WorkingHours[]> {
    await this.hoursRepo.delete({ userId });
    const entities = hours.map(h => this.hoursRepo.create({ ...h, userId }));
    return this.hoursRepo.save(entities);
  }
}
