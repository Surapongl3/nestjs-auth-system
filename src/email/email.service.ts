import { Injectable } from '@nestjs/common';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import * as nodemailer from 'nodemailer';
@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    // สำหรับ dev / testing ใช้ Mailtrap
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // เปลี่ยนเป็น SMTP ของคุณ
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
    });
  }

     async sendMail(to: string, subject: string, text: string) {
   
     const info = await this.transporter.sendMail({
      from: "NestJS Test"+ process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
      console.log('📧 Message sent: %s', info.messageId);
    return info;
  }

  create(createEmailDto: CreateEmailDto) {
    return 'This action adds a new email';
  }

  findAll() {
    return `This action returns all email`;
  }

  findOne(id: number) {
    return `This action returns a #${id} email`;
  }

  update(id: number, updateEmailDto: UpdateEmailDto) {
    return `This action updates a #${id} email`;
  }

  remove(id: number) {
    return `This action removes a #${id} email`;
  }
}
