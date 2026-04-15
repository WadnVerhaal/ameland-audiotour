'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { createAccessToken } from '@/lib/tokens/create-access-token';
import { OrderStatus } from '@/types/order';

export async function getSuccessState(
  orderId: string
): Promise<{ status: OrderStatus; accessUrl?: string }> {
  const supabase = createServerSupabase();

  const { data: order } = await supabase
    .from('orders')
    .select('id, tour_id, payment_status')
    .eq('id', orderId)
    .single();

  if (!order) {
    throw new Error('Bestelling niet gevonden');
  }

  if (order.payment_status !== 'paid') {
    return { status: order.payment_status as OrderStatus };
  }

  const { data: existingToken } = await supabase
    .from('access_tokens')
    .select('token')
    .eq('order_id', orderId)
    .maybeSingle();

  let token = existingToken?.token;

  if (!token) {
    token = createAccessToken();

    await supabase.from('access_tokens').insert({
      order_id: orderId,
      token,
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error('Missing NEXT_PUBLIC_APP_URL');
  }

  const accessUrl = `${appUrl}/access/${token}`;

  return { status: 'paid', accessUrl };
}