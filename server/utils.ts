import crypto from 'node:crypto';
import type { Response } from 'express';
import type { TaskRow } from './types.js';

export function createId() {
  return crypto.randomUUID();
}

export function sendError(response: Response, status: number, message: string) {
  response.status(status).json({ error: message });
}

export function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function mapTask(task: TaskRow) {
  return {
    id: task.id,
    title: task.title,
    category: task.category,
    completed: task.completed,
    time: task.planned_time || undefined,
    priority: task.priority || undefined,
    isRunning: task.is_running,
    elapsedTime: task.elapsed_seconds,
    scheduledFor: task.scheduled_for,
  };
}

export function calculateStats(tasks: TaskRow[], date: string) {
  const dayTasks = tasks.filter((task) => task.scheduled_for === date);
  const completedCount = dayTasks.filter((task) => task.completed).length;
  const runningSeconds = dayTasks.reduce((sum, task) => sum + task.elapsed_seconds, 0);
  const completionRate = dayTasks.length === 0 ? 0 : Math.round((completedCount / dayTasks.length) * 100);
  const focusScore = Math.min(100, completionRate + Math.min(40, Math.round(runningSeconds / 900) * 5));

  return {
    focusScore,
    completedCount,
    totalTasks: dayTasks.length,
    completionRate,
    focusMinutes: Math.round(runningSeconds / 60),
  };
}
