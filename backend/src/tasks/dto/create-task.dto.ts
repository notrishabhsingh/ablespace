import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Priority, TaskStatus } from '../../common/enums';

class ResourceDto {
  @IsString()
  @MaxLength(120)
  label: string;

  @IsString()
  @MaxLength(2000)
  url: string;
}

export class CreateTaskDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  members?: string[];

  @IsOptional()
  @IsMongoId()
  reporterId?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  watchers?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  teams?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourceDto)
  resources?: ResourceDto[];

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsMongoId()
  projectId?: string;

  @IsOptional()
  @IsMongoId()
  parentTaskId?: string;

  @IsOptional()
  @IsBoolean()
  locked?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;
}
