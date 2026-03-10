import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Permission } from 'src/auth/enum/permission.enum';
import { QueryUserDto } from 'src/dto/query-user.dto';
import { Permissions } from '../auth/decorator/permissions.decorator';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersService } from './users.service';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  ///Request → Guard → Strategy → validate → Controller
  ///Middleware → ทำงานก่อน routing
  ///Guard → ทำงานหลัง routing และรู้ว่าเข้า route ไหน
  ///Guard ใช้กับ authorization ได้ดีกว่า

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Query() query: QueryUserDto) {
    return this.usersService.findAll(query);
  }
  @Get('trash')
  getTrash() {
    return this.usersService.findTrash();
  }

  @UseGuards(AuthGuard('jwt'))
  @Permissions(Permission.VIEW_USERS)
  @Get('admin')
  getAdminData() {
    return 'Only admin can access';
  }
  @Post()
  @HttpCode(201)
  create(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const userId = Number(id);
    return this.usersService.findOne(userId);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.usersService.delete(Number(id));
  }

  @UseGuards(AuthGuard('jwt'))
  @Permissions(Permission.BAN_USER)
  @Patch(':id/ban')
  async banUser(@Param('id') id: string) {
    return this.usersService.banUser(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Permissions(Permission.BAN_USER)
  @Patch(':id/unban')
  async unbanUser(@Param('id') id: string) {
    return this.usersService.unbanUser(+id);
  }

  @Post(':id/restore')
  restoreUser(@Param('id') id: string) {
    return this.usersService.restore(+id);
  }

  @Post('upload-avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
       destination: './src/uploads',
        filename: (req, file, callback) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);

          callback(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    
    return {
      filename: file.filename,
       url: `/uploads/${file.filename}`,
    };
  }
}
