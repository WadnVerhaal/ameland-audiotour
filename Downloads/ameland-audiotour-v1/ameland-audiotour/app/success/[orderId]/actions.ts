'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { createAccessToken } from '@/lib/tokens/create-access-token';
import { sendAccessEmail } from '@/lib/mail/send-access-email';
import { OrderStatus } from '@/types/order';

export async function getSuccessState(orderId: string): Promise<{ status: OrderStatus; accessUrl?: string }> {
  console.log('getSuccessState called with orderId:', orderId);

  const supabase = createServerSupabase();

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, email, tour_id, payment_status')
    .eq('id', orderId)
    .single();

  console.log('Order lookup error:', orderError);
  console.log('Order found:', order);

  if (!order) throw new Error('Bestelling niet gevonden');

  if (order.payment_status !== 'paid') {
    const { error: updateError } = await supabase
      .from('orders')
      .update({ payment_status: 'paid' })
      .eq('id', orderId);

    console.log('Order payment_status update error:', updateError);
  }

  const { data: existingToken, error: tokenError } = await supabase
    .from('access_tokens')
    .select('*')
    .eq('order_id', orderId)
    .maybeSingle();

  console.log('Existing token lookup error:', tokenError);
  console.log('Existing token:', existingToken);

  let token = existingToken?.token;

  if (!token) {
    token = createAccessToken();
    const { error: insertError } = await supabase
      .from('access_tokens')
      .insert({ order_id: orderId, token });

    console.log('Token insert error:', insertError);
  }

  const { data: tour, error: tourError } = await supabase
    .from('tours')
    .select('title')
    .eq('id', order.tour_id)
    .single();

  console.log('Tour lookup error:', tourError);
  console.log('Tour found:', tour);

  const accessUrl = `${process.env.NEXT_PUBLIC_APP_URL}/access/${token}`;
  console.log('Generated accessUrl:', accessUrl);

  const emailResult = await sendAccessEmail({
    to: order.email,
    tourTitle: tour?.title ?? 'Ameland Audiotour',
    accessUrl,
  });

  console.log('Email send returned:', JSON.stringify(emailResult));

  return { status: 'paid', accessUrl };
}