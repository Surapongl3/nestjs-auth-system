import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { Cache } from 'cache-manager';
import * as fs from 'fs';
import { join } from 'path';
import { QueryUserDto } from 'src/dto/query-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { validateRealImage } from 'src/util/file-upload.util';
import { CreateUserDto } from '../dto/create-user.dto';
@Injectable()
export class UsersService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private prisma: PrismaService,
  ) {}
  async testCache() {
    await this.cacheManager.set('test-key', 'hello', 10000); // TTL = 10 วินาที
    const value = await this.cacheManager.get('test-key');
    console.log('cache value:', value); // จะได้ 'hello'
    return value;
  }
  async findAll(query: QueryUserDto) {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      isActive,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        {
          email: {
            contains: search,
          },
        },
        {
          name: {
            contains: search,
          },
        },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const users = await this.prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: order,
      },
      include: { posts: true },
    });

    const total = await this.prisma.user.count({
      where,
    });
    console.log('🔥 HIT DATABASE'); // ✅ ต้องอยู่ตรงนี้

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  async create(data: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    return user;
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }

    return user;
  }
  async delete(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
  async banUser(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        tokenVersion: {
          increment: 1,
        },
      },
    });
  }

  async unbanUser(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: {
        isActive: true,
      },
    });
  }

  async findTrash() {
    return this.prisma.user.findMany({
      where: {
        deletedAt: {
          not: null,
        },
      },
    });
  }

  async restore(id: number) {
    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: null,
      },
    });
  }

  async updateAvatar(userId: number, filename: string) {
    const newPath = join(process.cwd(), 'uploads', filename);

    // ✅ ตรวจว่าไฟล์เป็น image จริง
    try {
      await validateRealImage(newPath);
    } catch (err) {
      // ลบไฟล์ที่ upload มา
      if (fs.existsSync(newPath)) {
        fs.unlinkSync(newPath);
      }

      throw err;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // ลบ avatar เก่า
    if (user?.avatar) {
      const oldPath = join(process.cwd(), 'uploads', user.avatar);

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        avatar: filename,
      },
    });
  }
}
