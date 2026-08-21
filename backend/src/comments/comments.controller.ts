import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('tasks/:taskId/comments')
export class CommentsController {
  constructor(private readonly comments: CommentsService) {}

  @Get()
  list(@Param('taskId') taskId: string) {
    return this.comments.findByTask(taskId);
  }

  @Post()
  create(
    @CurrentUser('userId') userId: string,
    @Param('taskId') taskId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.comments.create(taskId, userId, dto);
  }

  @Delete(':commentId')
  remove(
    @CurrentUser('userId') userId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.comments.remove(commentId, userId);
  }
}
