import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;
  @IsEmail()
  email: string;
    @IsNotEmpty()
  @MinLength(4)
  password: string;
 @IsOptional()
  role:string
}