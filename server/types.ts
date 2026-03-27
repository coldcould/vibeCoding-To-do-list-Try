export type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  avatar_url: string | null;
  created_at: string;
};

export type ListRow = {
  id: string;
  user_id: string;
  name: string;
  is_system: boolean;
  created_at: string;
};

export type TaskRow = {
  id: string;
  user_id: string;
  list_id: string | null;
  title: string;
  category: string;
  completed: boolean;
  priority: 'Low' | 'Medium' | 'High' | null;
  scheduled_for: string;
  planned_time: string | null;
  is_running: boolean;
  elapsed_seconds: number;
  created_at: string;
  updated_at: string;
};

export type PasswordResetTokenRow = {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
};
