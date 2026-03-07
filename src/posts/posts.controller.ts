import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { CreatePostDto } from 'src/dto/create-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postService: PostsService) {}
  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Post()
  @HttpCode(201)
  create(@Body() body: CreatePostDto) {
    return this.postService.create(body);
  }
}
