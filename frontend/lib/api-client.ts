/**
 * HTTP Client dùng chung toàn hệ thống Frontend
 * Tự động kết nối tới Backend NestJS (NEXT_PUBLIC_API_URL) và xử lý lỗi chuẩn.
 */

const envApiUrl = (
  globalThis as { process?: { env?: Record<string, string | undefined> } }
).process?.env?.NEXT_PUBLIC_API_URL;

export const API_BASE_URL = envApiUrl || 'http://localhost:4000/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(', ')
      : data?.message || `Lỗi kết nối máy chủ (HTTP ${response.status})`;
    throw new ApiError(message, response.status);
  }

  return data as T;
}
