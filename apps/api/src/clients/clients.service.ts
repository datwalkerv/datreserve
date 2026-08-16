import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../entities/client.entity';
import { Appointment } from '../entities/appointment.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client) private readonly repo: Repository<Client>,
    @InjectRepository(Appointment) private readonly apptRepo: Repository<Appointment>,
  ) {}

  async findAll(userId: string) {
    const clients = await this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
    return Promise.all(clients.map(c => this.withStats(c, userId)));
  }

  async findOne(id: string, userId: string) {
    const c = await this.repo.findOne({ where: { id, userId } });
    if (!c) throw new NotFoundException();
    return this.withStats(c, userId);
  }

  private async withStats(client: Client, userId: string) {
    const count = await this.apptRepo.count({ where: { clientId: client.id, userId } });
    const last = await this.apptRepo.findOne({
      where: { clientId: client.id, userId },
      order: { startAt: 'DESC' },
    });
    return { ...client, bookingsCount: count, lastAppointment: last?.startAt ?? null };
  }

  create(userId: string, data: Partial<Client>) {
    const c = this.repo.create({ ...data, userId });
    return this.repo.save(c);
  }

  async update(id: string, userId: string, data: Partial<Client>) {
    const c = await this.repo.findOne({ where: { id, userId } });
    if (!c) throw new NotFoundException();
    Object.assign(c, data);
    return this.repo.save(c);
  }

  async remove(id: string, userId: string) {
    const c = await this.repo.findOne({ where: { id, userId } });
    if (!c) throw new NotFoundException();
    return this.repo.remove(c);
  }
}
