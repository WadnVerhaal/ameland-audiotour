import { createClient } from '@supabase/supabase-js';

export function createPublicServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('SUPABASE URL aanwezig:', !!url);
  console.log('ANON KEY aanwezig:', !!anonKey);

  if (!url || !anonKey) {
    throw new Error('Missing Supabase public server environment variables');
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}
