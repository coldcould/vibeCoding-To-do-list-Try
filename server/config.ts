import dotenv from 'dotenv';

dotenv.config();

function getEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function validateServiceRoleKey(key: string) {
  const parts = key.split('.');
  if (parts.length !== 3) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not a valid JWT.');
  }

  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as { role?: string };
    if (payload.role !== 'service_role') {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY must be the service_role key from Supabase, not the anon key.');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Failed to validate SUPABASE_SERVICE_ROLE_KEY.');
  }
}

const supabaseServiceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
validateServiceRoleKey(supabaseServiceRoleKey);

export const config = {
  port: Number(process.env.PORT || 3001),
  supabaseUrl: getEnv('SUPABASE_URL'),
  supabaseServiceRoleKey,
  sessionSecret: getEnv('SESSION_SECRET'),
};
