import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { ReorderTasksDto } from './dto/reorder-tasks.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Post()
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateTaskDto) {
    return this.tasks.create(userId, dto);
  }

  @Get()
  findAll(@CurrentUser('userId') userId: string, @Query() query: QueryTasksDto) {
    return this.tasks.findAll(userId, query);
  }

  // Declared before ':id' so it isn't captured as an id param.
  @Patch('reorder')
  reorder(@CurrentUser('userId') userId: string, @Body() dto: ReorderTasksDto) {
    return this.tasks.reorder(userId, dto);
  }

  @Get(':id')
  findOne(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.tasks.findOne(userId, id);
  }

  @Get(':id/activity')
  activity(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.tasks.getActivity(userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasks.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.tasks.remove(userId, id);
  }
}
