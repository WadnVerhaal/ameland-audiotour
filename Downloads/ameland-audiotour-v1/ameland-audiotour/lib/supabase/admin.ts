import { createClient } from '@supabase/supabase-js';

export function createAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('SUPABASE URL aanwezig:', !!url);
  console.log('SERVICE ROLE aanwezig:', !!serviceRoleKey);

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase admin environment variables');
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
