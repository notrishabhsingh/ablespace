import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ trim: true })
  email?: string;

  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ trim: true })
  username?: string;

  // Job title / role (shown on the profile screen).
  @Prop({ trim: true })
  title?: string;

  @Prop()
  avatarUrl?: string;

  // Label shown in the sidebar workspace switcher.
  @Prop({ trim: true })
  workspaceName?: string;

  @Prop({ default: false })
  isGuest: boolean;

  // For seeded teammate users: the guest workspace they belong to. Lets the
  // team endpoint scope assignable members per workspace. Null for real/guest
  // account holders.
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  ownerId?: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Expose `id` (string) instead of `_id`/`__v` in JSON responses.
UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    Reflect.deleteProperty(ret, '_id');
    return ret;
  },
});
