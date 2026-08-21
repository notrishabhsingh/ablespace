import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  /** Current authenticated user's profile. */
  @Get('me')
  me(@CurrentUser('userId') userId: string) {
    return this.users.findById(userId);
  }

  /** Assignable teammates in the current workspace (self + seeded members). */
  @Get('team')
  team(@CurrentUser('userId') userId: string) {
    return this.users.findTeam(userId);
  }

  /** Update the current user's profile (name, title, username, etc.). */
  @Patch('me')
  update(@CurrentUser('userId') userId: string, @Body() dto: UpdateUserDto) {
    return this.users.updateProfile(userId, dto);
  }
}
