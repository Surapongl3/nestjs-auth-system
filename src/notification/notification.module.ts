import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { EmailModule } from 'src/email/email.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmailService } from 'src/email/email.service';

@Module({
  imports: [PrismaModule, EmailModule], // ✅ ถูกแล้ว
  controllers: [NotificationController],
  providers: [NotificationService,EmailService],
})
export class NotificationModule {}
