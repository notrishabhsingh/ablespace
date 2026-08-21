import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';

const AUTHOR = { path: 'authorId', select: 'fullName username avatarUrl' };

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private readonly model: Model<CommentDocument>,
  ) {}

  create(taskId: string, authorId: string, dto: CreateCommentDto) {
    return this.model.create({
      taskId,
      authorId,
      body: dto.body,
      parentId: dto.parentId ?? null,
    });
  }

  findByTask(taskId: string) {
    return this.model
      .find({ taskId })
      .sort({ createdAt: 1 })
      .populate(AUTHOR)
      .exec();
  }

  async remove(id: string, authorId: string) {
    const deleted = await this.model
      .findOneAndDelete({ _id: id, authorId })
      .exec();
    if (!deleted) throw new NotFoundException('Comment not found');
    return { id };
  }

  deleteByTask(taskId: string) {
    return this.model.deleteMany({ taskId }).exec();
  }
}
