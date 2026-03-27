import { Router } from 'express';
import { generateResetToken, hashPassword, hashResetToken, issueToken, verifyPassword } from './auth.js';
import { requireAuth } from './middleware.js';
import { supabase } from './supabase.js';
import type { ListRow, PasswordResetTokenRow, TaskRow, UserRow } from './types.js';
import { calculateStats, createId, getTodayDate, mapTask, sendError } from './utils.js';

const router = Router();

async function getUserByEmail(email: string) {
  return supabase
    .from('app_users')
    .select('*')
    .eq('email', email.toLowerCase())
    .maybeSingle();
}

async function getDashboardData(userId: string, date: string) {
  const [{ data: user, error: userError }, { data: customLists, error: listError }, { data: tasks, error: taskError }] =
    await Promise.all([
      supabase.from('app_users').select('id, name, email, avatar_url').eq('id', userId).single(),
      supabase.from('lists').select('*').eq('user_id', userId).eq('is_system', false).order('created_at', { ascending: true }),
      supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    ]);

  if (userError || listError || taskError) {
    throw userError || listError || taskError;
  }

  const typedTasks = (tasks || []) as TaskRow[];
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar_url || '',
    },
    customLists: ((customLists || []) as ListRow[]).map((list) => list.name),
    tasks: typedTasks.map(mapTask),
    stats: calculateStats(typedTasks, date),
  };
}

router.get('/health', (_request, response) => {
  response.json({ ok: true });
});

router.post('/auth/signup', async (request, response) => {
  const name = String(request.body?.name || '').trim();
  const email = String(request.body?.email || '').trim().toLowerCase();
  const password = String(request.body?.password || '');

  if (!name || !email || password.length < 6) {
    sendError(response, 400, 'Please provide a name, a valid email, and a password with at least 6 characters.');
    return;
  }

  const { data: existingUser, error: existingUserError } = await getUserByEmail(email);
  if (existingUserError) {
    sendError(response, 500, existingUserError.message);
    return;
  }

  if (existingUser) {
    sendError(response, 409, 'An account with this email already exists.');
    return;
  }

  const userId = createId();
  const defaultDate = getTodayDate();
  const userInsert = await supabase.from('app_users').insert({
    id: userId,
    name,
    email,
    password_hash: hashPassword(password),
    avatar_url: null,
  });

  if (userInsert.error) {
    sendError(response, 500, userInsert.error.message);
    return;
  }

  const defaultLists = ['Work', 'Personal', 'Archive'].map((listName) => ({
    id: createId(),
    user_id: userId,
    name: listName,
    is_system: true,
  }));

  const sampleTasks = [
    {
      id: createId(),
      user_id: userId,
      list_id: null,
      title: 'Review the Q4 Product Strategy',
      category: 'Work',
      completed: false,
      priority: 'High',
      scheduled_for: defaultDate,
      planned_time: '10:30 AM',
      is_running: false,
      elapsed_seconds: 0,
    },
    {
      id: createId(),
      user_id: userId,
      list_id: null,
      title: 'Morning meditation session',
      category: 'Personal',
      completed: true,
      priority: null,
      scheduled_for: defaultDate,
      planned_time: null,
      is_running: false,
      elapsed_seconds: 0,
    },
  ];

  const [listInsert, taskInsert] = await Promise.all([
    supabase.from('lists').insert(defaultLists),
    supabase.from('tasks').insert(sampleTasks),
  ]);

  if (listInsert.error || taskInsert.error) {
    sendError(response, 500, listInsert.error?.message || taskInsert.error?.message || 'Failed to initialize account.');
    return;
  }

  const token = issueToken(userId, email);
  const dashboard = await getDashboardData(userId, defaultDate);
  response.status(201).json({ token, ...dashboard });
});

router.post('/auth/login', async (request, response) => {
  const email = String(request.body?.email || '').trim().toLowerCase();
  const password = String(request.body?.password || '');

  if (!email || !password) {
    sendError(response, 400, 'Email and password are required.');
    return;
  }

  const { data: user, error } = await getUserByEmail(email);
  if (error) {
    sendError(response, 500, error.message);
    return;
  }

  if (!user || !verifyPassword(password, user.password_hash)) {
    sendError(response, 401, 'Invalid email or password.');
    return;
  }

  const token = issueToken(user.id, user.email);
  const dashboard = await getDashboardData(user.id, getTodayDate());
  response.json({ token, ...dashboard });
});

router.post('/auth/forgot-password', async (request, response) => {
  const email = String(request.body?.email || '').trim().toLowerCase();
  if (!email) {
    sendError(response, 400, 'Email is required.');
    return;
  }

  const { data: user, error } = await getUserByEmail(email);
  if (error) {
    sendError(response, 500, error.message);
    return;
  }

  if (!user) {
    response.json({
      message: 'If an account exists for this email, a reset link is ready.',
    });
    return;
  }

  await supabase.from('password_reset_tokens').delete().eq('user_id', user.id).is('used_at', null);

  const rawToken = generateResetToken();
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();

  const insert = await supabase.from('password_reset_tokens').insert({
    id: createId(),
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  if (insert.error) {
    sendError(response, 500, insert.error.message);
    return;
  }

  const origin = `${request.protocol}://${request.get('host')}`;
  const resetUrl = `${origin}/?resetToken=${encodeURIComponent(rawToken)}`;

  response.json({
    message: 'Your reset link is ready. Open it to choose a new password.',
    resetUrl,
  });
});

router.post('/auth/reset-password', async (request, response) => {
  const token = String(request.body?.token || '').trim();
  const password = String(request.body?.password || '');

  if (!token || password.length < 6) {
    sendError(response, 400, 'A valid reset token and a password with at least 6 characters are required.');
    return;
  }

  const tokenHash = hashResetToken(token);
  const { data: resetToken, error: tokenError } = await supabase
    .from('password_reset_tokens')
    .select('*')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (tokenError) {
    sendError(response, 500, tokenError.message);
    return;
  }

  const typedResetToken = resetToken as PasswordResetTokenRow | null;
  if (!typedResetToken || typedResetToken.used_at || new Date(typedResetToken.expires_at).getTime() < Date.now()) {
    sendError(response, 400, 'This reset link is invalid or has expired.');
    return;
  }

  const [userUpdate, tokenUpdate] = await Promise.all([
    supabase
      .from('app_users')
      .update({ password_hash: hashPassword(password) })
      .eq('id', typedResetToken.user_id),
    supabase
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', typedResetToken.id),
  ]);

  if (userUpdate.error || tokenUpdate.error) {
    sendError(response, 500, userUpdate.error?.message || tokenUpdate.error?.message || 'Failed to reset password.');
    return;
  }

  response.json({
    message: 'Password updated successfully. You can sign in with your new password now.',
  });
});

router.get('/bootstrap', requireAuth, async (request, response) => {
  try {
    const date = String(request.query.date || getTodayDate());
    const dashboard = await getDashboardData(request.auth!.userId, date);
    response.json(dashboard);
  } catch (error) {
    sendError(response, 500, error instanceof Error ? error.message : 'Failed to load dashboard.');
  }
});

router.get('/stats', requireAuth, async (request, response) => {
  const date = String(request.query.date || getTodayDate());
  const { data, error } = await supabase.from('tasks').select('*').eq('user_id', request.auth!.userId);

  if (error) {
    sendError(response, 500, error.message);
    return;
  }

  response.json(calculateStats((data || []) as TaskRow[], date));
});

router.post('/lists', requireAuth, async (request, response) => {
  const name = String(request.body?.name || '').trim();
  if (!name) {
    sendError(response, 400, 'List name is required.');
    return;
  }

  const insert = await supabase
    .from('lists')
    .insert({
      id: createId(),
      user_id: request.auth!.userId,
      name,
      is_system: false,
    })
    .select('*')
    .single();

  if (insert.error) {
    sendError(response, 500, insert.error.message);
    return;
  }

  response.status(201).json({ name: (insert.data as ListRow).name });
});

router.post('/tasks', requireAuth, async (request, response) => {
  const title = String(request.body?.title || '').trim();
  const category = String(request.body?.category || 'Personal').trim();
  const scheduledFor = String(request.body?.scheduledFor || getTodayDate());

  if (!title) {
    sendError(response, 400, 'Task title is required.');
    return;
  }

  const insert = await supabase
    .from('tasks')
    .insert({
      id: createId(),
      user_id: request.auth!.userId,
      list_id: null,
      title,
      category,
      completed: false,
      priority: null,
      scheduled_for: scheduledFor,
      planned_time: null,
      is_running: false,
      elapsed_seconds: 0,
    })
    .select('*')
    .single();

  if (insert.error) {
    sendError(response, 500, insert.error.message);
    return;
  }

  response.status(201).json(mapTask(insert.data as TaskRow));
});

router.patch('/tasks/:taskId', requireAuth, async (request, response) => {
  const taskId = request.params.taskId;
  const { data: existingTask, error: fetchError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .eq('user_id', request.auth!.userId)
    .single();

  if (fetchError || !existingTask) {
    sendError(response, 404, 'Task not found.');
    return;
  }

  const updates = {
    completed: typeof request.body?.completed === 'boolean' ? request.body.completed : existingTask.completed,
    is_running: typeof request.body?.isRunning === 'boolean' ? request.body.isRunning : existingTask.is_running,
    elapsed_seconds:
      typeof request.body?.elapsedTime === 'number' ? Math.max(0, request.body.elapsedTime) : existingTask.elapsed_seconds,
    scheduled_for: String(request.body?.scheduledFor || existingTask.scheduled_for),
    updated_at: new Date().toISOString(),
  };

  if (updates.completed) {
    updates.is_running = false;
  }

  const update = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .eq('user_id', request.auth!.userId)
    .select('*')
    .single();

  if (update.error) {
    sendError(response, 500, update.error.message);
    return;
  }

  response.json(mapTask(update.data as TaskRow));
});

export { router };
