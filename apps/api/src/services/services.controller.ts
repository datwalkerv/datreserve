import { Controller, Get, Post, Patch, Delete, Body, Param, Req } from '@nestjs/common';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {
  constructor(private readonly svc: ServicesService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.svc.findAll(req.user?.id || 'dev');
  }

  @Post()
  create(@Req() req: any, @Body() body: any) {
    return this.svc.create(req.user?.id || 'dev', body);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.svc.findOne(id, req.user?.id || 'dev');
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    return this.svc.update(id, req.user?.id || 'dev', body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.svc.remove(id, req.user?.id || 'dev');
  }
}
