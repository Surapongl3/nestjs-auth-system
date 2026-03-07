import { Injectable } from '@nestjs/common';
import { CreatePostDto } from 'src/dto/create-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}
  async create(data: CreatePostDto) {
    return this.prisma.post.create({ data });
  }

  async findAll() {
    return this.prisma.post.findMany({
      include: { user: true },
    });
  }
}
