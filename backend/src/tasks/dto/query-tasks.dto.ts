import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { Priority, TaskStatus } from '../../common/enums';

/** Query params for GET /tasks. */
export class QueryTasksDto {
  // Limit to a project. Omit for workspace-root tasks.
  @IsOptional()
  @IsMongoId()
  projectId?: string;

  // Fetch subtasks of a specific parent task.
  @IsOptional()
  @IsMongoId()
  parentTaskId?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  // Case-insensitive title search.
  @IsOptional()
  @IsString()
  search?: string;
}
