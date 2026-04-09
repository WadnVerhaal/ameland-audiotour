import { createServerSupabase } from '@/lib/supabase/server';

export async function getTourByAccessToken(token: string) {
  const supabase = createServerSupabase();

  const { data: tokenRow, error: tokenError } = await supabase
    .from('access_tokens')
    .select('id, order_id, token, expires_at')
    .eq('token', token)
    .single();

  if (tokenError || !tokenRow) return null;
  if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) return null;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, tour_id, payment_status, email')
    .eq('id', tokenRow.order_id)
    .single();

  if (orderError || !order || order.payment_status !== 'paid') return null;

  const { data: tour } = await supabase.from('tours').select('*').eq('id', order.tour_id).single();
  const { data: stops } = await supabase
    .from('tour_stops')
    .select('*')
    .eq('tour_id', order.tour_id)
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  await supabase.from('access_tokens').update({ last_opened_at: new Date().toISOString() }).eq('id', tokenRow.id);

  return { order, tour, stops: stops ?? [] };
}
