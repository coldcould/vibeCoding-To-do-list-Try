export type Category = 'Inbox' | 'Work' | 'Personal' | 'Archive' | string;
export type Priority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  title: string;
  category: Category;
  completed: boolean;
  time?: string;
  priority?: Priority;
  isRunning?: boolean;
  elapsedTime?: number;
  scheduledFor: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Stats {
  focusScore: number;
  completedCount: number;
  totalTasks: number;
  completionRate: number;
  focusMinutes: number;
}

export interface DashboardData {
  user: User;
  tasks: Task[];
  customLists: string[];
  stats: Stats;
}

export interface AuthPayload extends DashboardData {
  token: string;
}

export interface ForgotPasswordResponse {
  message: string;
  resetUrl?: string;
}
