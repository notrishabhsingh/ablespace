import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Priority, TaskStatus } from '../../common/enums';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true, default: '' })
  description: string;

  @Prop({ type: String, enum: Priority, default: Priority.NO_PRIORITY })
  priority: Priority;

  @Prop({ type: String, enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  // "Lead" column in the projects table.
  @Prop({ type: Types.ObjectId, ref: 'User' })
  leadId?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  members: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reporterId?: Types.ObjectId;

  @Prop()
  dueDate?: Date;

  @Prop({ type: [String], default: [] })
  labels: string[];

  @Prop({ type: [String], default: [] })
  teams: string[];

  @Prop({ default: 0 })
  order: number;

  // Owner (guest/user) this project belongs to — used to scope all queries.
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId: Types.ObjectId;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// Expose `id` (string) instead of `_id`/`__v` in JSON responses.
ProjectSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    Reflect.deleteProperty(ret, '_id');
    return ret;
  },
});
