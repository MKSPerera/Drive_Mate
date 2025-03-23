import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { FirebaseService } from '../notifications/firebase.service';
import { NotificationService } from './notifications.service';
import { JwtAuthGuard } from '../admin/guards/jwt-auth.guard';
import { DriverAuthGuard } from '../driver/guards/driver-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly notificationService: NotificationService,
  ) {}

  @Post('send')
  async sendNotification(@Body() data: { token: string; title: string; body: string }) {
    return this.firebaseService.sendPushNotification(data.token, data.title, data.body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin')
  async getAdminNotifications(@Request() req) {
    return this.notificationService.getAdminNotifications(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('read/:id')
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markNotificationAsRead(parseInt(id));
  }

  @UseGuards(DriverAuthGuard)
  @Get()
  async getNotifications(@Request() req) {
    return this.notificationService.getDriverNotifications(req.user.driverId);
  }
}
