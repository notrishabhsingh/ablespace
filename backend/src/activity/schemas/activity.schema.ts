import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ActivityDocument = HydratedDocument<Activity>;

export enum ActivityType {
  CREATED = 'created',
  STATUS_CHANGED = 'status_changed',
  PRIORITY_CHANGED = 'priority_changed',
  ASSIGNED = 'assigned',
  DUE_DATE_CHANGED = 'due_date_changed',
  UPDATED = 'updated',
}

/** An entry in a task's "Updates" activity feed. */
@Schema({ timestamps: true })
export class Activity {
  @Prop({ type: Types.ObjectId, ref: 'Task', required: true, index: true })
  taskId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: ActivityType, required: true })
  type: ActivityType;

  @Prop({ required: true })
  message: string;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);

// Expose `id` (string) instead of `_id`/`__v` in JSON responses.
ActivitySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    Reflect.deleteProperty(ret, '_id');
    return ret;
  },
});
