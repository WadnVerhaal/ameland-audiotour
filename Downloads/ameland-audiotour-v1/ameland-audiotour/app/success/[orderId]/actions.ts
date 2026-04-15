'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { createAccessToken } from '@/lib/tokens/create-access-token';
import { sendAccessEmail } from '@/lib/mail/send-access-email';
import { OrderStatus } from '@/types/order';

export async function getSuccessState(orderId: string): Promise<{ status: OrderStatus; accessUrl?: string }> {
  const supabase = createServerSupabase();
  const { data: order } = await supabase
    .from('orders')
    .select('id, email, tour_id, payment_status')
    .eq('id', orderId)
    .single();

  if (!order) throw new Error('Bestelling niet gevonden');
 if (order.payment_status !== 'paid') {
  await supabase
    .from('orders')
    .update({ payment_status: 'paid' })
    .eq('id', orderId);
}

  const { data: existingToken } = await supabase.from('access_tokens').select('*').eq('order_id', orderId).maybeSingle();

  let token = existingToken?.token;
  if (!token) {
    token = createAccessToken();
    await supabase.from('access_tokens').insert({ order_id: orderId, token });
  }

  const { data: tour } = await supabase.from('tours').select('title').eq('id', order.tour_id).single();
  const accessUrl = `${process.env.NEXT_PUBLIC_APP_URL}/access/${token}`;

 await sendAccessEmail({
  to: order.email,
  tourTitle: tour?.title ?? 'Ameland Audiotour',
  accessUrl,
});

  return { status: 'paid', accessUrl };
}
