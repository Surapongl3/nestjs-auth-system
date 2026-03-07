import { Permission } from './permission.enum';
import { Role } from './role.enum';

export const RolePermissions = {
  [Role.ADMIN]: [
    Permission.BAN_USER,
    Permission.VIEW_USERS,
    Permission.DELETE_POST,
  ],

  [Role.USER]: [Permission.CREATE_POST],
};
