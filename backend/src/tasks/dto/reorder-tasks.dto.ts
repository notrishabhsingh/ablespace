import { ArrayNotEmpty, IsArray, IsEnum, IsMongoId } from 'class-validator';
import { TaskStatus } from '../../common/enums';

/**
 * Sent after a drag-and-drop: the destination column's status plus the full
 * ordered list of task ids in that column. Each task's `order` is set to its
 * index and its `status` to the given column.
 */
export class ReorderTasksDto {
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  orderedIds: string[];
}
