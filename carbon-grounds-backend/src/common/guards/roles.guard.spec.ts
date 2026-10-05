import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { FIELD_DATA_ROLES } from '../decorators/roles.decorator';
import { UserRole } from '../../modules/users/entities/user.entity';

function contextFor(user: unknown): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

function guardRequiring(roles: unknown[] | undefined) {
  const reflector = { getAllAndOverride: () => roles } as unknown as Reflector;
  return new RolesGuard(reflector);
}

describe('RolesGuard', () => {
  it('allows any authenticated user when the route has no @Roles', () => {
    expect(guardRequiring(undefined).canActivate(contextFor({ role: UserRole.VIEWER }))).toBe(true);
  });

  describe('FIELD_DATA_ROLES', () => {
    const guard = guardRequiring(FIELD_DATA_ROLES);

    it.each([UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.FIELD_OFFICER])('allows staff role %s', (role) => {
      expect(guard.canActivate(contextFor({ role }))).toBe(true);
    });

    it('allows farmer-app logins', () => {
      expect(guard.canActivate(contextFor({ id: 'f1', mobile: '9999999999', type: 'farmer' }))).toBe(true);
    });

    it.each([UserRole.ANALYST, UserRole.VIEWER])('blocks read-only role %s', (role) => {
      expect(guard.canActivate(contextFor({ role }))).toBe(false);
    });
  });

  it('keeps farmers out of staff-only routes', () => {
    const guard = guardRequiring([UserRole.ADMIN, UserRole.PROJECT_MANAGER]);
    expect(guard.canActivate(contextFor({ type: 'farmer' }))).toBe(false);
  });

  it('blocks a request with no user', () => {
    expect(guardRequiring([UserRole.ADMIN]).canActivate(contextFor(undefined))).toBe(false);
  });
});
