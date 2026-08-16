import { Controller, Post, Req, UnauthorizedException } from '@nestjs/common';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('sign')
  sign(@Req() req: any) {
    if (!req.user?.id) throw new UnauthorizedException();
    return this.uploadsService.generateSignature();
  }
}
