import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { WorkspaceSeedService } from '../seed/workspace-seed.service';
import { UserDocument } from '../users/schemas/user.schema';

const ADJECTIVES = ['Curious', 'Brave', 'Clever', 'Swift', 'Calm', 'Bright', 'Bold', 'Lucky'];
const ANIMALS = ['Fox', 'Otter', 'Falcon', 'Panda', 'Tiger', 'Dolphin', 'Wolf', 'Heron'];

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly seeder: WorkspaceSeedService,
  ) {}

  /** Create a guest user, seed their workspace, and return a signed session. */
  async guestLogin() {
    const name = `${pick(ADJECTIVES)} ${pick(ANIMALS)}`;
    const user = await this.users.create({
      fullName: name,
      username: name.toLowerCase().replace(/\s+/g, ''),
      workspaceName: `${name.split(' ')[0]}'s Workspace`,
      avatarUrl: avatar(name),
      isGuest: true,
    });

    // Populate a starter board so the guest doesn't land on an empty screen.
    await this.seeder.seedForUser(String(user._id));

    return this.sign(user);
  }

  me(userId: string) {
    return this.users.findById(userId);
  }

  private sign(user: UserDocument) {
    const token = this.jwt.sign({
      sub: String(user._id),
      isGuest: user.isGuest,
    });
    return { token, user };
  }
}
