import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Project, ProjectDocument } from '../projects/schemas/project.schema';
import { Task, TaskDocument } from '../tasks/schemas/task.schema';
import { Comment, CommentDocument } from '../comments/schemas/comment.schema';
import {
  Activity,
  ActivityDocument,
  ActivityType,
} from '../activity/schemas/activity.schema';
import { Priority } from '../common/enums/priority.enum';
import { TaskStatus } from '../common/enums/task-status.enum';

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;

interface TaskSpec {
  title: string;
  status: TaskStatus;
  priority: Priority;
  members: string[];
  labels: string[];
  dueDate: string;
  description?: string;
}

@Injectable()
export class WorkspaceSeedService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
    @InjectModel(Activity.name)
    private readonly activityModel: Model<ActivityDocument>,
  ) {}

  /**
   * Populate a fresh workspace for `ownerId` with demo teammates, projects,
   * tasks across every board column, subtasks, a comment, and activity — so a
   * guest lands on a populated board that mirrors the Figma design.
   */
  async seedForUser(ownerId: string | Types.ObjectId): Promise<void> {
    const owner = new Types.ObjectId(ownerId);

    // 1) Teammates referenced as members / leads.
    const teammateNames = [
      'Admin',
      'Designer',
      'QA Team',
      'Security',
      'Dev Team',
      'Product',
    ];
    const teammates = await this.userModel.insertMany(
      teammateNames.map((name) => ({
        fullName: name,
        username: name.toLowerCase().replace(/\s+/g, '_'),
        avatarUrl: avatar(name),
        isGuest: false,
        ownerId: owner,
      })),
    );
    const byName: Record<string, Types.ObjectId> = {};
    teammates.forEach((t) => {
      byName[t.fullName] = t._id as Types.ObjectId;
    });

    // 2) Projects (mirrors the Projects screen).
    await this.projectModel.insertMany([
      {
        name: 'Design Homepage',
        priority: Priority.HIGH,
        status: TaskStatus.TODO,
        leadId: byName['Designer'],
        dueDate: new Date('2026-09-12'),
        ownerId: owner,
        order: 0,
      },
      {
        name: 'Develop Login Feature',
        priority: Priority.LOW,
        status: TaskStatus.DOING,
        dueDate: new Date('2026-09-15'),
        ownerId: owner,
        order: 1,
      },
      {
        name: 'Test Payment Gateway',
        priority: Priority.MEDIUM,
        status: TaskStatus.TODO,
        leadId: byName['QA Team'],
        dueDate: new Date('2026-09-18'),
        ownerId: owner,
        order: 2,
      },
    ]);

    // 3) Workspace-level board tasks.
    const specs: TaskSpec[] = [
      {
        title: 'Write API Documentation',
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        members: ['Designer'],
        labels: ['Research', 'Design', 'Development', 'Testing', 'Deployment'],
        dueDate: '2026-07-31',
        description:
          'Create clear and detailed API documentation to guide developers in using the inventory and sales metrics features effectively.',
      },
      { title: 'Implement Search Function', status: TaskStatus.TODO, priority: Priority.MEDIUM, members: ['Admin'], labels: ['Development'], dueDate: '2026-07-29' },
      { title: 'Deploy to Production', status: TaskStatus.TODO, priority: Priority.HIGH, members: ['Admin'], labels: ['Deployment'], dueDate: '2026-07-29' },
      { title: 'Code Review Completed', status: TaskStatus.DOING, priority: Priority.MEDIUM, members: ['Admin'], labels: ['Deployment'], dueDate: '2026-07-29' },
      { title: 'Design Mockups Finalized', status: TaskStatus.DOING, priority: Priority.LOW, members: ['Designer'], labels: ['Design'], dueDate: '2026-07-29' },
      { title: 'Feature Testing Passed', status: TaskStatus.COMPLETED, priority: Priority.MEDIUM, members: ['QA Team'], labels: ['Testing'], dueDate: '2026-07-30' },
      { title: 'UI Design Updated', status: TaskStatus.COMPLETED, priority: Priority.LOW, members: ['Designer'], labels: ['Design'], dueDate: '2026-07-31' },
      { title: 'Security Audit Scheduled', status: TaskStatus.COMPLETED, priority: Priority.URGENT, members: ['Security'], labels: ['Audit'], dueDate: '2026-08-01' },
      { title: 'UI Review', status: TaskStatus.ON_HOLD, priority: Priority.MEDIUM, members: ['Designer'], labels: ['Design', 'Review'], dueDate: '2026-08-05' },
      { title: 'Backend Integration', status: TaskStatus.ON_HOLD, priority: Priority.HIGH, members: ['Dev Team'], labels: ['Development'], dueDate: '2026-08-06' },
      { title: 'User Feedback', status: TaskStatus.ON_HOLD, priority: Priority.LOW, members: ['Product'], labels: ['Research'], dueDate: '2026-08-07' },
      { title: 'Performance Optimization', status: TaskStatus.ON_HOLD, priority: Priority.MEDIUM, members: ['Dev Team'], labels: ['Development'], dueDate: '2026-08-08' },
    ];

    const orderByStatus: Record<string, number> = {};
    const createdTasks = await this.taskModel.insertMany(
      specs.map((s) => {
        const order = orderByStatus[s.status] ?? 0;
        orderByStatus[s.status] = order + 1;
        return {
          title: s.title,
          description: s.description ?? '',
          status: s.status,
          priority: s.priority,
          labels: s.labels,
          members: s.members.map((m) => byName[m]).filter(Boolean),
          reporterId: owner,
          dueDate: new Date(s.dueDate),
          ownerId: owner,
          order,
        };
      }),
    );

    // 4) Subtasks + comment + activity for "Write API Documentation".
    const parent = createdTasks.find(
      (t) => t.title === 'Write API Documentation',
    );
    if (parent) {
      const parentId = parent._id as Types.ObjectId;
      await this.taskModel.insertMany([
        { title: 'Subtask 1', status: TaskStatus.TODO, priority: Priority.HIGH, members: [byName['Designer']], dueDate: new Date('2026-09-12'), parentTaskId: parentId, ownerId: owner, order: 0 },
        { title: 'Subtask 2', status: TaskStatus.TODO, priority: Priority.LOW, dueDate: new Date('2026-09-15'), parentTaskId: parentId, ownerId: owner, order: 1 },
        { title: 'Subtask 3', status: TaskStatus.TODO, priority: Priority.MEDIUM, dueDate: new Date('2026-09-18'), parentTaskId: parentId, ownerId: owner, order: 2 },
      ]);
      await this.commentModel.create({
        taskId: parentId,
        authorId: owner,
        body: 'Kicked this off — drafting the endpoint reference first.',
      });
      await this.activityModel.insertMany([
        { taskId: parentId, userId: owner, type: ActivityType.CREATED, message: 'created this task' },
        { taskId: parentId, userId: owner, type: ActivityType.PRIORITY_CHANGED, message: 'changed priority from No priority to High' },
      ]);
    }
  }
}
