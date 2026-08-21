import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** Start a guest session — returns { token, user }. */
  @Post('guest')
  guest() {
    return this.auth.guestLogin();
  }

  /** Return the currently authenticated user (used to hydrate the session). */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser('userId') userId: string) {
    return this.auth.me(userId);
  }
}
