import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreatePostDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsInt()
  userId: number;
}