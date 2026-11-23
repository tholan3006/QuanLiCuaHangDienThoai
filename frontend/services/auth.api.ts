import { apiRequest } from '../lib/api-client';
import { AuthResponse } from '../lib/auth';

export interface RegisterCredentials {
  email: string;
  password: string;
}

export async function login(identifier: string, password: string) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });
}

export async function register(credentials: RegisterCredentials) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}
