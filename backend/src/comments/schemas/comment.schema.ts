import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'Task', required: true, index: true })
  taskId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  body: string;

  // Set for a reply, pointing at the parent comment (one level of threading).
  @Prop({ type: Types.ObjectId, ref: 'Comment', default: null })
  parentId?: Types.ObjectId | null;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

// Expose `id` (string) instead of `_id`/`__v` in JSON responses.
CommentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    Reflect.deleteProperty(ret, '_id');
    return ret;
  },
});
