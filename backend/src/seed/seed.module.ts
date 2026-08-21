import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Project, ProjectSchema } from '../projects/schemas/project.schema';
import { Task, TaskSchema } from '../tasks/schemas/task.schema';
import { Comment, CommentSchema } from '../comments/schemas/comment.schema';
import { Activity, ActivitySchema } from '../activity/schemas/activity.schema';
import { WorkspaceSeedService } from './workspace-seed.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Activity.name, schema: ActivitySchema },
    ]),
  ],
  providers: [WorkspaceSeedService],
  exports: [WorkspaceSeedService],
})
export class SeedModule {}
