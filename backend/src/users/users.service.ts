import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  create(data: Partial<User>): Promise<UserDocument> {
    return this.userModel.create(data);
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Assignable people for a workspace: the account holder plus the seeded
   * teammates scoped to them. Powers member/reporter/lead pickers.
   */
  async findTeam(ownerId: string): Promise<UserDocument[]> {
    const [self, teammates] = await Promise.all([
      this.userModel.findById(ownerId).exec(),
      this.userModel.find({ ownerId }).sort({ fullName: 1 }).exec(),
    ]);
    return self ? [self, ...teammates] : teammates;
  }

  async updateProfile(id: string, dto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
