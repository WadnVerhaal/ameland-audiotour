import { createServerSupabase } from '@/lib/supabase/server';

export type AccessLookupResult =
  | {
      status: 'ok';
      order: any;
      tour: any;
      stops: any[];
    }
  | {
      status: 'expired';
    }
  | {
      status: 'invalid';
    };

export async function getTourByAccessToken(token: string): Promise<AccessLookupResult> {
  const supabase = createServerSupabase();

  const { data: tokenRow, error: tokenError } = await supabase
    .from('access_tokens')
    .select('id, order_id, token, expires_at')
    .eq('token', token)
    .single();

  if (tokenError || !tokenRow) {
    return { status: 'invalid' };
  }

  if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) {
    return { status: 'expired' };
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, tour_id, payment_status, email')
    .eq('id', tokenRow.order_id)
    .single();

  if (orderError || !order || order.payment_status !== 'paid') {
    return { status: 'invalid' };
  }

  const { data: tour } = await supabase
    .from('tours')
    .select('*')
    .eq('id', order.tour_id)
    .single();

  const { data: stops } = await supabase
    .from('tour_stops')
    .select('*')
    .eq('tour_id', order.tour_id)
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  await supabase
    .from('access_tokens')
    .update({ last_opened_at: new Date().toISOString() })
    .eq('id', tokenRow.id);

  return {
    status: 'ok',
    order,
    tour,
    stops: stops ?? [],
  };
}

export async function getAccessTokenByOrderId(orderId: string) {
  const supabase = createServerSupabase();

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, payment_status')
    .eq('id', orderId)
    .single();

  if (orderError || !order || order.payment_status !== 'paid') return null;

  const { data: tokenRow, error: tokenError } = await supabase
    .from('access_tokens')
    .select('token, expires_at')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (tokenError || !tokenRow) return null;
  if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) return null;

  return tokenRow.token;
}