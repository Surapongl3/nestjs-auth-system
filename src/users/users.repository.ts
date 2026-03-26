import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IUserRepository } from './interface/user.repository.interface';

@Injectable()
export class UsersRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  findAll(where: any, skip: number, take: number, orderBy: any) {
    return this.prisma.user.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { posts: true },
    });
  }

  count(where: any) {
    return this.prisma.user.count({ where });
  }

  findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  create(data: any) {
    return this.prisma.user.create({ data });
  }

  update(id: number, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
