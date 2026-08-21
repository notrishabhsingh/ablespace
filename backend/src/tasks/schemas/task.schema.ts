import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Priority, TaskStatus } from '../../common/enums';

export type TaskDocument = HydratedDocument<Task>;

/** A linked resource (document / URL) attached to a task. */
@Schema({ _id: false })
export class Resource {
  @Prop({ required: true, trim: true })
  label: string;

  @Prop({ required: true, trim: true })
  url: string;
}
const ResourceSchema = SchemaFactory.createForClass(Resource);

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true, default: '' })
  description: string;

  @Prop({ type: String, enum: TaskStatus, default: TaskStatus.TODO, index: true })
  status: TaskStatus;

  @Prop({ type: String, enum: Priority, default: Priority.NO_PRIORITY })
  priority: Priority;

  @Prop({ type: [String], default: [] })
  labels: string[];

  // "Members" column — assignees on the task.
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  members: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reporterId?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  watchers: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  teams: string[];

  @Prop({ type: [ResourceSchema], default: [] })
  resources: Resource[];

  // Date range shown in the details panel ("Jan 10 -> End").
  @Prop()
  startDate?: Date;

  @Prop()
  dueDate?: Date;

  // Project this task belongs to (optional — tasks can live at workspace root).
  @Prop({ type: Types.ObjectId, ref: 'Project', index: true })
  projectId?: Types.ObjectId;

  // Set when this task is a subtask of another.
  @Prop({ type: Types.ObjectId, ref: 'Task', index: true })
  parentTaskId?: Types.ObjectId;

  @Prop({ default: false })
  locked: boolean;

  // Ordering within a status column / group (for drag-and-drop).
  @Prop({ default: 0 })
  order: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId: Types.ObjectId;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

// Expose `id` (string) instead of `_id`/`__v` in JSON responses.
TaskSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    Reflect.deleteProperty(ret, '_id');
    return ret;
  },
});
