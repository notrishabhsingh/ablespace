import {
  IsArray,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Priority, TaskStatus } from '../../common/enums';

export class CreateProjectDto {
  @IsString()
  @MaxLength(160)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsMongoId()
  leadId?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  members?: string[];

  @IsOptional()
  @IsMongoId()
  reporterId?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  teams?: string[];
}
