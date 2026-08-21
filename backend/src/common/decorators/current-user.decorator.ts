import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Shape attached to req.user by the JWT strategy. */
export interface AuthUser {
  userId: string;
  isGuest: boolean;
}

/**
 * Convenience decorator to pull the authenticated user off the request.
 * Usage: someHandler(@CurrentUser() user: AuthUser) { ... }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext): AuthUser | AuthUser[keyof AuthUser] => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthUser;
    return data ? user?.[data] : user;
  },
);
