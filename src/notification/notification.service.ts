import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

 async createNotification(userId: number, title: string, message: string) {
    // 1. save to DB
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        title,
        message,
      },
    });

    // 2. ดึง email user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // 3. ส่ง email
    if (user?.email) {
      await this.emailService.sendMail(
        user.email,
        title,
        message,
      );
    }

    return notification;
  }

  async getUserNotifications(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: number) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }
}