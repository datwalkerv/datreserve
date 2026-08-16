import { Controller, Get, Patch, Body, Req } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) return null;
    return this.usersService.findByUserId(userId);
  }

  @Patch('me/onboarding/stage1')
  async stage1(@Req() req: any, @Body() body: any) {
    return this.usersService.updateOnboardingStage(req.user?.id, 1, body);
  }

  @Patch('me/onboarding/stage2')
  async stage2(@Req() req: any, @Body() body: any) {
    return this.usersService.updateOnboardingStage(req.user?.id, 2, body);
  }

  @Patch('me/onboarding/stage3')
  async stage3(@Req() req: any, @Body() body: any) {
    return this.usersService.updateOnboardingStage(req.user?.id, 3, body);
  }

  @Patch('me/onboarding/stage4')
  async stage4(@Req() req: any, @Body() body: any) {
    return this.usersService.updateOnboardingStage(req.user?.id, 4, body);
  }

  @Patch('settings/profile')
  async updateProfile(@Req() req: any, @Body() body: any) {
    return this.usersService.updateProfile(req.user?.id, body);
  }

  @Get('me/working-hours')
  async getWorkingHours(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) return [];
    return this.usersService.getWorkingHours(userId);
  }
}
