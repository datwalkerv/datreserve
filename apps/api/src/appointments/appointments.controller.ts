import { Controller, Get, Post, Patch, Body, Param, Req, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentStatus } from '@datreserve/shared-types';
import { CreatePublicBookingDto } from './dto/create-public-booking.dto';

@Controller()
export class AppointmentsController {
  constructor(private readonly svc: AppointmentsService) {}

  @Get('appointments')
  findAll(@Req() req: any, @Query('from') from: string, @Query('to') to: string) {
    return this.svc.findAll(req.user?.id || 'dev', from, to);
  }

  @Patch('appointments/:id/status')
  updateStatus(@Param('id') id: string, @Req() req: any, @Body() body: { status: AppointmentStatus }) {
    return this.svc.updateStatus(id, req.user?.id || 'dev', body.status);
  }

  @Get('public/:slug')
  getPublicProfile(@Param('slug') slug: string) {
    return this.svc.getPublicProfile(slug);
  }

  @Get('public/:slug/availability')
  getAvailability(
    @Param('slug') slug: string,
    @Query('serviceId') serviceId: string,
    @Query('date') date: string,
  ) {
    return this.svc.getAvailability(slug, serviceId, date);
  }

  @Post('public/:slug/book')
  createBooking(@Param('slug') slug: string, @Body() body: CreatePublicBookingDto) {
    return this.svc.createPublicBooking(slug, body);
  }
}
