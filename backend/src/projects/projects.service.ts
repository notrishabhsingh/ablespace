import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

// Only expose lightweight user fields when populating references.
const USER_FIELDS = 'fullName username avatarUrl';
const POPULATE = [
  { path: 'leadId', select: USER_FIELDS },
  { path: 'members', select: USER_FIELDS },
  { path: 'reporterId', select: USER_FIELDS },
];

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name)
    private readonly model: Model<ProjectDocument>,
  ) {}

  create(ownerId: string, dto: CreateProjectDto) {
    return this.model.create({ ...dto, ownerId: new Types.ObjectId(ownerId) });
  }

  findAll(ownerId: string) {
    return this.model
      .find({ ownerId: new Types.ObjectId(ownerId) })
      .sort({ order: 1, createdAt: 1 })
      .populate(POPULATE)
      .exec();
  }

  async findOne(ownerId: string, id: string) {
    const project = await this.model
      .findOne({ _id: id, ownerId: new Types.ObjectId(ownerId) })
      .populate(POPULATE)
      .exec();
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(ownerId: string, id: string, dto: UpdateProjectDto) {
    const project = await this.model
      .findOneAndUpdate({ _id: id, ownerId: new Types.ObjectId(ownerId) }, dto, { new: true })
      .populate(POPULATE)
      .exec();
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async remove(ownerId: string, id: string) {
    const deleted = await this.model
      .findOneAndDelete({ _id: id, ownerId: new Types.ObjectId(ownerId) })
      .exec();
    if (!deleted) throw new NotFoundException('Project not found');
    return { id };
  }
}
