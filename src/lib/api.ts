import type { AuthPayload, DashboardData, ForgotPasswordResponse, Stats, Task } from '../types';
import { getSessionToken } from './session';

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getSessionToken();
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(payload.error || 'Request failed.', response.status);
  }

  return payload as T;
}

export async function login(payload: { email: string; password: string }) {
  return request<AuthPayload>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function signup(payload: { name: string; email: string; password: string }) {
  return request<AuthPayload>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function forgotPassword(payload: { email: string }) {
  return request<ForgotPasswordResponse>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function resetPassword(payload: { token: string; password: string }) {
  return request<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function bootstrapDashboard(date: string) {
  return request<DashboardData>(`/bootstrap?date=${encodeURIComponent(date)}`);
}

export async function createList(name: string) {
  return request<{ name: string }>('/lists', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function createTask(payload: { title: string; category: string; scheduledFor: string }) {
  return request<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateTask(taskId: string, payload: Partial<Task>) {
  return request<Task>(`/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function fetchStats(date: string) {
  return request<Stats>(`/stats?date=${encodeURIComponent(date)}`);
}

export { ApiError };
