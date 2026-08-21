import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schemas/task.schema';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { ActivityModule } from '../activity/activity.module';
import { CommentsModule } from '../comments/comments.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    ActivityModule,
    CommentsModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
