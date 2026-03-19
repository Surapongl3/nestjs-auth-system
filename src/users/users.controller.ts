import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
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
import { Throttle } from '@nestjs/throttler';
import { diskStorage } from 'multer';
import { Permission } from 'src/auth/enum/permission.enum';
import { QueryUserDto } from 'src/dto/query-user.dto';
import { generateFilename, imageFileFilter } from 'src/util/file-upload.util';
import { Permissions } from '../auth/decorator/permissions.decorator';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersService } from './users.service';
import { get } from 'http';
import { retry } from 'rxjs';
import { log } from 'console';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  ///Request → Guard → Strategy → validate → Controller
  ///Middleware → ทำงานก่อน routing
  ///Guard → ทำงานหลัง routing และรู้ว่าเข้า route ไหน
  ///Guard ใช้กับ authorization ได้ดีกว่า
 
  // @UseGuards(AuthGuard('jwt'))
   @UseInterceptors(CacheInterceptor)
  @CacheKey('users_list')
  @CacheTTL(1000000)
  @Get()
  findAll(@Query() query: QueryUserDto) {
      console.log('🔥 HIT CONTROLLER'); 
    
    return this.usersService.findAll(query);
  }
 @Get('test')
  async redis (){ 
    return this.usersService.testCache()
  }

  @Get('trash')
  getTrash() {
    return this.usersService.findTrash();
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseGuards(AuthGuard('jwt'))
  @Permissions(Permission.VIEW_USERS)
  @Get('admin')
  getAdminData() {
    return 'Only admin can access';
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post()
  @HttpCode(201)
  create(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(Number(id));
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.usersService.delete(Number(id));
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
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

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('upload-avatar/:id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const name = generateFilename(file);
          callback(null, name);
        },
      }),
      fileFilter: imageFileFilter,
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateAvatar(Number(id), file.filename);
  }

 
}
