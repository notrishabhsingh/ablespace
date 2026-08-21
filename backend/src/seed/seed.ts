/**
 * Standalone seed script — `npm run seed`.
 * Creates a persistent "Dexter" demo workspace (matching the Figma) for local
 * development. Guests already get their own seeded workspace on login, so this
 * is optional but handy for a stable demo account.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { WorkspaceSeedService } from './workspace-seed.service';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const users = app.get(UsersService, { strict: false });
    const seeder = app.get(WorkspaceSeedService, { strict: false });

    const demo = await users.create({
      fullName: 'Dexter',
      email: 'dexter@gmail.com',
      username: 'dexuser',
      title: 'Designer',
      workspaceName: 'Dexter',
      avatarUrl: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Dexter',
      isGuest: false,
    });

    await seeder.seedForUser(String(demo._id));

    // eslint-disable-next-line no-console
    console.log(`✅ Seeded demo workspace for "Dexter" (${String(demo._id)})`);
    // eslint-disable-next-line no-console
    console.log('ℹ️  Guests also get their own seeded workspace automatically on login.');
  } finally {
    await app.close();
  }
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
