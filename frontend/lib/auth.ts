export type AppRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface AuthUser {
  mataikhoan: number;
  tendangnhap: string;
  email: string;
  role: AppRole;
}

export interface AuthResponse {
  access_token: string;
  user: AuthUser;
}

export function saveAuth(response: AuthResponse) {
  localStorage.setItem('access_token', response.access_token);
  localStorage.setItem('auth_user', JSON.stringify(response.user));
  window.dispatchEvent(new Event('auth-change'));
}

export function readAuthUser(): AuthUser | null {
  const rawUser = localStorage.getItem('auth_user');
  if (!rawUser) return null;

  try {
    const user = JSON.parse(rawUser) as AuthUser;
    if (
      typeof user.mataikhoan === 'number' &&
      typeof user.role === 'string' &&
      ['ADMIN', 'STAFF', 'CUSTOMER'].includes(user.role)
    ) {
      return user;
    }
  } catch {
    localStorage.removeItem('auth_user');
  }
  return null;
}

export function clearAuth() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('auth_user');
  window.dispatchEvent(new Event('auth-change'));
}

export function getRoleHome(role: AppRole) {
  if (role === 'ADMIN') return '/admin/accounts';
  if (role === 'STAFF') return '/staff/dashboard';
  return '/products';
}
