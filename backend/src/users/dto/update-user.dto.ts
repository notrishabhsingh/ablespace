import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  title?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  workspaceName?: string;
}
