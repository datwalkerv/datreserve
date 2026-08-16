import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../entities/service.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly repo: Repository<Service>,
  ) {}

  findAll(userId: string) {
    return this.repo.find({ where: { userId }, order: { createdAt: 'ASC' } });
  }

  async findOne(id: string, userId: string) {
    const s = await this.repo.findOne({ where: { id, userId } });
    if (!s) throw new NotFoundException();
    return s;
  }

  create(userId: string, data: Partial<Service>) {
    const s = this.repo.create({ ...data, userId });
    return this.repo.save(s);
  }

  async update(id: string, userId: string, data: Partial<Service>) {
    const s = await this.findOne(id, userId);
    Object.assign(s, data);
    return this.repo.save(s);
  }

  async remove(id: string, userId: string) {
    const s = await this.findOne(id, userId);
    return this.repo.remove(s);
  }
}
