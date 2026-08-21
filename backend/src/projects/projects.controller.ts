import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Post()
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateProjectDto) {
    return this.projects.create(userId, dto);
  }

  @Get()
  findAll(@CurrentUser('userId') userId: string) {
    return this.projects.findAll(userId);
  }

  @Get(':id')
  findOne(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.projects.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projects.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.projects.remove(userId, id);
  }
}
