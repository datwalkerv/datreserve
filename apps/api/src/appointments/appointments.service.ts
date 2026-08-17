import { Injectable, NotFoundException } from '@nestjs/common';

/** Convert a wall-clock time on a calendar date to a UTC Date, respecting the
 *  given IANA timezone. Works without any external date library. */
function localTimeToUTC(dateStr: string, hour: number, minute: number, timezone: string): Date {
  // Build an approximate UTC timestamp treating the local time as UTC
  const [y, mo, d] = dateStr.split('-').map(Number);
  const approx = new Date(Date.UTC(y, mo - 1, d, hour, minute));

  // Find what wall-clock time the approx UTC instant shows in the target tz
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric', minute: 'numeric', hour12: false,
  }).formatToParts(approx);
  const localH = parseInt(parts.find(p => p.type === 'hour')!.value) % 24;
  const localM = parseInt(parts.find(p => p.type === 'minute')!.value);

  // Shift approx by the difference between desired and actual local time
  const diffMs = ((hour * 60 + minute) - (localH * 60 + localM)) * 60_000;
  return new Date(approx.getTime() - diffMs);
}

/** Get the day-of-week (0=Sun…6=Sat) for a YYYY-MM-DD date in a given timezone. */
function weekdayInTZ(dateStr: string, timezone: string): number {
  const [y, mo, d] = dateStr.split('-').map(Number);
  const noon = new Date(Date.UTC(y, mo - 1, d, 12, 0)); // noon UTC avoids DST edge cases
  const dayName = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'short' })
    .format(noon);
  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(dayName);
}
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
import { Service } from '../entities/service.entity';
import { WorkingHours } from '../entities/working-hours.entity';
import { UserProfile } from '../entities/user-profile.entity';
import { Client } from '../entities/client.entity';
import { AppointmentStatus } from '@datreserve/shared-types';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment) private readonly apptRepo: Repository<Appointment>,
    @InjectRepository(Service) private readonly svcRepo: Repository<Service>,
    @InjectRepository(WorkingHours) private readonly hoursRepo: Repository<WorkingHours>,
    @InjectRepository(UserProfile) private readonly profileRepo: Repository<UserProfile>,
    @InjectRepository(Client) private readonly clientRepo: Repository<Client>,
  ) {}

  findAll(userId: string, from?: string, to?: string) {
    const where: any = { userId };
    if (from && to) {
      where.startAt = Between(new Date(from), new Date(to));
    }
    return this.apptRepo.find({ where, order: { startAt: 'ASC' } });
  }

  async updateStatus(id: string, userId: string, status: AppointmentStatus) {
    const appt = await this.apptRepo.findOne({ where: { id, userId } });
    if (!appt) throw new NotFoundException();
    appt.status = status;
    return this.apptRepo.save(appt);
  }

  async getAvailability(slug: string, serviceId: string, date: string): Promise<{ slots: { startAt: string; endAt: string }[]; timezone: string }> {
    const profile = await this.profileRepo.findOne({ where: { slug } });
    if (!profile) throw new NotFoundException('Provider not found');

    const service = await this.svcRepo.findOne({ where: { id: serviceId, userId: profile.userId } });
    if (!service) throw new NotFoundException('Service not found');

    const requestedDate = new Date(date);
    const tz = profile.timezone || 'UTC';
    const weekday = weekdayInTZ(date, tz);

    const hours = await this.hoursRepo.findOne({ where: { userId: profile.userId, weekday } });
    if (!hours || !hours.isOpen) return { slots: [], timezone: tz };

    const durationMinutes = service.durationUnit === 'hours'
      ? service.durationValue * 60
      : service.durationValue;

    const [sh, sm] = hours.startTime.split(':').map(Number);
    const [eh, em] = hours.endTime.split(':').map(Number);
    const dayStart = localTimeToUTC(date, sh, sm, tz);
    const dayEnd = localTimeToUTC(date, eh, em, tz);

    const dayEndBoundary = localTimeToUTC(date, 23, 59, tz);
    dayEndBoundary.setUTCSeconds(59, 999);
    const existing = await this.apptRepo.find({
      where: {
        userId: profile.userId,
        startAt: Between(dayStart, dayEndBoundary),
        status: AppointmentStatus.CONFIRMED,
      },
    });

    const now = new Date();
    const cutoff = new Date(now.getTime() + profile.bookingCutoffHours * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + profile.bookingWindowDays * 24 * 60 * 60 * 1000);

    const slots: { startAt: string; endAt: string }[] = [];
    let cursor = new Date(dayStart);

    while (cursor.getTime() + durationMinutes * 60 * 1000 <= dayEnd.getTime()) {
      const slotEnd = new Date(cursor.getTime() + durationMinutes * 60 * 1000);

      if (cursor >= cutoff && cursor <= windowEnd) {
        const overlaps = existing.some(a => cursor < a.endAt && slotEnd > a.startAt);
        if (!overlaps) {
          slots.push({ startAt: cursor.toISOString(), endAt: slotEnd.toISOString() });
        }
      }

      cursor = new Date(cursor.getTime() + hours.slotIntervalMinutes * 60 * 1000);
    }

    return { slots, timezone: tz };
  }

  async createPublicBooking(slug: string, data: {
    serviceId: string;
    startAt: string;
    clientName: string;
    clientEmail?: string;
    clientPhone?: string;
    clientNotes?: string;
  }) {
    const profile = await this.profileRepo.findOne({ where: { slug } });
    if (!profile) throw new NotFoundException('Provider not found');

    const service = await this.svcRepo.findOne({ where: { id: data.serviceId, userId: profile.userId } });
    if (!service) throw new NotFoundException('Service not found');

    const durationMinutes = service.durationUnit === 'hours'
      ? service.durationValue * 60
      : service.durationValue;

    const startAt = new Date(data.startAt);
    const endAt = new Date(startAt.getTime() + durationMinutes * 60 * 1000);

    let client: Client | null = null;
    if (data.clientEmail) {
      client = await this.clientRepo.findOne({ where: { userId: profile.userId, email: data.clientEmail } });
    }
    if (!client) {
      client = this.clientRepo.create({
        userId: profile.userId,
        name: data.clientName,
        email: data.clientEmail,
        phoneNumber: data.clientPhone,
      });
      client = await this.clientRepo.save(client);
    }

    const appt = this.apptRepo.create({
      userId: profile.userId,
      serviceId: service.id,
      clientId: client.id,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      clientNotes: data.clientNotes,
      startAt,
      endAt,
      status: AppointmentStatus.CONFIRMED,
      icsUid: uuidv4(),
    });

    return this.apptRepo.save(appt);
  }

  async getPublicProfile(slug: string) {
    const profile = await this.profileRepo.findOne({ where: { slug } });
    if (!profile) throw new NotFoundException('Provider not found');
    const services = await this.svcRepo.find({ where: { userId: profile.userId } });
    return { profile, services };
  }
}
