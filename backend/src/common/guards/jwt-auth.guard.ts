import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Authenticates a request using the registered 'jwt' Passport strategy.
 * Lives in `common` so any feature module can use it without importing AuthModule.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
