import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserProfile } from '../entities/user-profile.entity';
import { WorkingHours } from '../entities/working-hours.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfile, WorkingHours])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
