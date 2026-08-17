import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from './auth/auth.middleware';
import { UserProfile } from './entities/user-profile.entity';
import { WorkingHours } from './entities/working-hours.entity';
import { Service } from './entities/service.entity';
import { Client } from './entities/client.entity';
import { Appointment } from './entities/appointment.entity';
import { UsersModule } from './users/users.module';
import { ServicesModule } from './services/services.module';
import { ClientsModule } from './clients/clients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        entities: [UserProfile, WorkingHours, Service, Client, Appointment],
        synchronize: config.get('DATABASE_SYNC') === 'true' || config.get('NODE_ENV') !== 'production',
        logging: config.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    ServicesModule,
    ClientsModule,
    AppointmentsModule,
    UploadsModule,
  ],
  providers: [AuthMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
