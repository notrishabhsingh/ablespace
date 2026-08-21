import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, AnyBulkWriteOperation } from 'mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { ReorderTasksDto } from './dto/reorder-tasks.dto';
import { ActivityService } from '../activity/activity.service';
import { CommentsService } from '../comments/comments.service';
import { ActivityType } from '../activity/schemas/activity.schema';
import { Priority, TaskStatus } from '../common/enums';

const USER_FIELDS = 'fullName username avatarUrl';
const POPULATE = [
  { path: 'members', select: USER_FIELDS },
  { path: 'reporterId', select: USER_FIELDS },
  { path: 'watchers', select: USER_FIELDS },
  { path: 'projectId', select: 'name' },
];

// Human-readable labels for activity messages.
const STATUS_LABEL: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: 'Backlog',
  [TaskStatus.TODO]: 'To Do',
  [TaskStatus.DOING]: 'Doing',
  [TaskStatus.COMPLETED]: 'Completed',
  [TaskStatus.ON_HOLD]: 'On Hold',
};
const PRIORITY_LABEL: Record<Priority, string> = {
  [Priority.NO_PRIORITY]: 'No priority',
  [Priority.URGENT]: 'Urgent',
  [Priority.HIGH]: 'High',
  [Priority.MEDIUM]: 'Medium',
  [Priority.LOW]: 'Low',
};

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    private readonly activity: ActivityService,
    private readonly comments: CommentsService,
  ) {}

  async create(ownerId: string, dto: CreateTaskDto) {
    const task = await this.taskModel.create({
      ...dto,
      ownerId: new Types.ObjectId(ownerId),
    });
    await this.activity.log(
      String(task._id),
      ownerId,
      ActivityType.CREATED,
      'created this task',
    );
    return this.findOne(ownerId, String(task._id));
  }

  findAll(ownerId: string, q: QueryTasksDto) {
    const filter: FilterQuery<TaskDocument> = { ownerId: new Types.ObjectId(ownerId) };

    if (q.parentTaskId) {
      // Subtasks of a specific parent.
      filter.parentTaskId = q.parentTaskId;
    } else {
      // Top-level tasks, scoped to a project or the workspace root.
      filter.parentTaskId = null;
      filter.projectId = q.projectId ?? null;
    }

    if (q.status) filter.status = q.status;
    if (q.priority) filter.priority = q.priority;
    if (q.search) filter.title = { $regex: q.search, $options: 'i' };

    return this.taskModel
      .find(filter)
      .sort({ order: 1, createdAt: 1 })
      .populate(POPULATE)
      .exec();
  }

  async findOne(ownerId: string, id: string) {
    const task = await this.taskModel
      .findOne({ _id: id, ownerId: new Types.ObjectId(ownerId) })
      .populate(POPULATE)
      .exec();
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(ownerId: string, id: string, dto: UpdateTaskDto) {
    const existing = await this.taskModel.findOne({ _id: id, ownerId: new Types.ObjectId(ownerId) }).exec();
    if (!existing) throw new NotFoundException('Task not found');

    // Record meaningful changes in the activity feed.
    const entries: { type: ActivityType; message: string }[] = [];
    if (dto.status && dto.status !== existing.status) {
      entries.push({
        type: ActivityType.STATUS_CHANGED,
        message: `changed status from ${STATUS_LABEL[existing.status]} to ${STATUS_LABEL[dto.status]}`,
      });
    }
    if (dto.priority && dto.priority !== existing.priority) {
      entries.push({
        type: ActivityType.PRIORITY_CHANGED,
        message: `changed priority from ${PRIORITY_LABEL[existing.priority]} to ${PRIORITY_LABEL[dto.priority]}`,
      });
    }

    await this.taskModel.updateOne({ _id: id, ownerId: new Types.ObjectId(ownerId) }, dto).exec();
    for (const e of entries) {
      await this.activity.log(id, ownerId, e.type, e.message);
    }
    return this.findOne(ownerId, id);
  }

  /** Apply a new column + ordering after a drag-and-drop. */
  async reorder(ownerId: string, dto: ReorderTasksDto) {
    const ops: AnyBulkWriteOperation<TaskDocument>[] = dto.orderedIds.map(
      (id, index) => ({
        updateOne: {
          filter: { _id: id, ownerId: new Types.ObjectId(ownerId) },
          update: { $set: { status: dto.status, order: index } },
        },
      }),
    );
    if (ops.length) await this.taskModel.bulkWrite(ops);
    return { ok: true };
  }

  async remove(ownerId: string, id: string) {
    const deleted = await this.taskModel
      .findOneAndDelete({ _id: id, ownerId: new Types.ObjectId(ownerId) })
      .exec();
    if (!deleted) throw new NotFoundException('Task not found');

    // Cascade: remove subtasks, comments and activity for this task.
    await this.taskModel.deleteMany({ parentTaskId: id, ownerId: new Types.ObjectId(ownerId) }).exec();
    await this.comments.deleteByTask(id);
    await this.activity.deleteByTask(id);
    return { id };
  }

  async getActivity(ownerId: string, id: string) {
    await this.findOne(ownerId, id); // authorization guard
    return this.activity.findByTask(id);
  }
}
