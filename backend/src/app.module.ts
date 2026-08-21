import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { CommentsModule } from './comments/comments.module';
import { ActivityModule } from './activity/activity.module';

@Module({
  imports: [
    // Loads .env and makes ConfigService available everywhere.
    ConfigModule.forRoot({ isGlobal: true }),

    // Single Mongo connection, configured asynchronously from env.
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    CommentsModule,
    ActivityModule,
  ],
})
export class AppModule {}
