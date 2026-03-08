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
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorator/roles.decorator';

import { Role } from 'src/auth/enum/role.enum';
import { PermissionsGuard } from 'src/auth/guard/permissions.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Permissions } from '../auth/decorator/permissions.decorator';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersService } from './users.service';
import { Permission } from 'src/auth/enum/permission.enum';
import { QueryUserDto } from 'src/dto/query-user.dto';

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
}
