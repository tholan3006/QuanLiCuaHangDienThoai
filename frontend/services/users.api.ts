import { apiRequest } from '../lib/api-client';
import { AppRole } from '../lib/auth';

export interface Account {
  mataikhoan: number;
  tendangnhap: string;
  email: string;
  fullName: string;
  role: AppRole | null;
  isActive: boolean;
}

export interface CreateAccount {
  email: string;
  password: string;
  role: AppRole;
}

export interface UpdateAccount {
  email: string;
  role: AppRole;
}

export const fetchAccounts = () => apiRequest<Account[]>('/users');

export const createAccount = (account: CreateAccount) =>
  apiRequest<Account>('/users', {
    method: 'POST',
    body: JSON.stringify(account),
  });

export const updateAccount = (id: number, account: UpdateAccount) =>
  apiRequest<Account>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      email: account.email,
      role: account.role,
    }),
  });

export const setAccountActive = (id: number, isActive: boolean) =>
  apiRequest<Account>(`/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  });
