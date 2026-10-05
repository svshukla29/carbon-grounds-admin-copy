import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../modules/users/entities/user.entity';

export const ROLES_KEY = 'roles';

/** Pseudo-role for farmer-app logins (jwt-farmer), which carry no staff role. */
export const FARMER = 'FARMER' as const;
export type AppRole = UserRole | typeof FARMER;

export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);

/** Who may record field data (plots, trees, measurements, photos): field staff
 * and the farmer app — not read-only roles like Analyst or Viewer. */
export const FIELD_DATA_ROLES: AppRole[] = [
  UserRole.ADMIN,
  UserRole.PROJECT_MANAGER,
  UserRole.FIELD_OFFICER,
  FARMER,
];
