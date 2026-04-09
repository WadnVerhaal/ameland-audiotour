import { createClient } from '@supabase/supabase-js';

export function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('SUPABASE URL aanwezig:', !!url);
  console.log('SERVICE ROLE aanwezig:', !!serviceRoleKey);

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase server environment variables');
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}