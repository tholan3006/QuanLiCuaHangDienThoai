import { SetMetadata } from '@nestjs/common';
import { AppRole, ROLES_KEY } from '../auth.constants';

export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
