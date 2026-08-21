import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Activity,
  ActivityDocument,
  ActivityType,
} from './schemas/activity.schema';

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(Activity.name)
    private readonly model: Model<ActivityDocument>,
  ) {}

  log(taskId: string, userId: string, type: ActivityType, message: string) {
    return this.model.create({ taskId, userId, type, message });
  }

  findByTask(taskId: string) {
    return this.model
      .find({ taskId })
      .sort({ createdAt: -1 })
      .populate({ path: 'userId', select: 'fullName username avatarUrl' })
      .exec();
  }

  deleteByTask(taskId: string) {
    return this.model.deleteMany({ taskId }).exec();
  }
}
