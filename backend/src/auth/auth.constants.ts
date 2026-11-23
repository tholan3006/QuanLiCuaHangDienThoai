export const ROLES_KEY = 'roles';

export const ROLE_NAMES = {
  ADMIN: 'ADMIN',
  STAFF: 'NHAN_VIEN',
  CUSTOMER: 'KHACH_HANG',
} as const;

export type AppRole = keyof typeof ROLE_NAMES;

export function toAppRole(roleName: string): AppRole | undefined {
  return (Object.keys(ROLE_NAMES) as AppRole[]).find(
    (role) => ROLE_NAMES[role] === roleName,
  );
}
