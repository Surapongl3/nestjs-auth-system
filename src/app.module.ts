import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import * as redisStore from 'cache-manager-ioredis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PermissionsGuard } from './auth/guard/permissions.guard';
import { PostsController } from './posts/posts.controller';
import { PostsModule } from './posts/posts.module';
import { PostsService } from './posts/posts.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { EmailModule } from './email/email.module';
import { NotificationModule } from './notification/notification.module';
@Module({
  imports: [
    UsersModule,
    PrismaModule,
    PostsModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: '127.0.0.1',
      port: 6379,
      ttl: 1000, // TTL in seconds
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 10,
      },
    ]),
    EmailModule,
    NotificationModule,
  ],
  controllers: [AppController, PostsController],
  providers: [
    AppService,
    PostsService,
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
