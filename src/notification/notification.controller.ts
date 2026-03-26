import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async create(
    @Body() body: { userId: number; title: string; message: string },
  ) {
    return this.notificationService.createNotification(
      body.userId,
      body.title,
      body.message,
    );
  }

  @Get(':userId')
  async getUser(@Param('userId') userId: string) {
    return this.notificationService.getUserNotifications(Number(userId));
  }

  @Post(':id/read')
  async read(@Param('id') id: string) {
    return this.notificationService.markAsRead(Number(id));
  }
}
