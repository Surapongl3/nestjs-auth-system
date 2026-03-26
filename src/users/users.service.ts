import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { Cache } from 'cache-manager';
import * as fs from 'fs';
import { join } from 'path';
import { QueryUserDto } from 'src/dto/query-user.dto';
import { validateRealImage } from 'src/util/file-upload.util';
import { CreateUserDto } from '../dto/create-user.dto';
import { IUserRepository } from './interface/user.repository.interface';

@Injectable()
export class UsersService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject('USER_REPO')
    private usersRepo: IUserRepository,
  ) {}

  async testCache() {
    await this.cacheManager.set('test-key', 'hello', 10000);
    const value = await this.cacheManager.get('test-key');
  
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
        { email: { contains: search } },
        { name: { contains: search } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const users = await this.usersRepo.findAll(where, skip, limit, {
      [sortBy]: order,
    });

    const total = await this.usersRepo.count(where);



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

    return this.usersRepo.create({
      ...data,
      password: hashedPassword,
    });
  }

  async findOne(id: number) {
    const user = await this.usersRepo.findById(id);

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return user;
  }

  async delete(id: number) {
    return this.usersRepo.update(id, {
      deletedAt: new Date(),
    });
  }

  async banUser(id: number) {
    return this.usersRepo.update(id, {
      isActive: false,
      tokenVersion: {
        increment: 1,
      },
    });
  }

  async unbanUser(id: number) {
    return this.usersRepo.update(id, {
      isActive: true,
    });
  }

  async findTrash() {
    return this.usersRepo.findAll({ deletedAt: { not: null } }, 0, 100, {
      createdAt: 'desc',
    });
  }

  async restore(id: number) {
    return this.usersRepo.update(id, {
      deletedAt: null,
    });
  }

  async updateAvatar(userId: number, filename: string) {
    const newPath = join(process.cwd(), 'uploads', filename);

    // validate file
    try {
      await validateRealImage(newPath);
    } catch (err) {
      if (fs.existsSync(newPath)) {
        fs.unlinkSync(newPath);
      }
      throw err;
    }

    const user = await this.usersRepo.findById(userId);

    if (user?.avatar) {
      const oldPath = join(process.cwd(), 'uploads', user.avatar);

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    return this.usersRepo.update(userId, {
      avatar: filename,
    });
  }
}
