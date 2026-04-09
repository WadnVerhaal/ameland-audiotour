'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { createPayment } from '@/lib/mollie/create-payment';
import { getTourBySlug } from '@/lib/data/tours';
import { validateEmail } from '@/lib/utils/text';

export async function startCheckout(slug: string, formData: FormData) {
  const email = validateEmail(String(formData.get('email') || ''));
  const tour = await getTourBySlug(slug);
  if (!tour || !tour.is_active) throw new Error('Tour niet gevonden');

  const cookieStore = await cookies();
  const ref = cookieStore.get('partner_ref')?.value;
  const supabase = createServerSupabase();

  let partnerId: string | null = null;
  if (ref) {
    const { data: partner } = await supabase.from('partners').select('id').eq('qr_slug', ref).maybeSingle();
    partnerId = partner?.id ?? null;
  }

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      tour_id: tour.id,
      email,
      partner_id: partnerId,
      amount_cents: tour.price_cents,
      payment_status: 'pending',
      payment_provider: 'mollie',
    })
    .select('*')
    .single();

  if (error || !order) throw new Error('Kon bestelling niet aanmaken');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) throw new Error('Missing NEXT_PUBLIC_APP_URL');

  const payment = await createPayment({
    amountCents: tour.price_cents,
    description: tour.title,
    redirectUrl: `${appUrl}/success/${order.id}`,
    webhookUrl: `${appUrl}/api/mollie/webhook`,
    metadata: { orderId: order.id, tourId: tour.id },
  });

  await supabase.from('orders').update({ payment_reference: payment.id }).eq('id', order.id);
  const checkoutUrl = payment.getCheckoutUrl();

if (!checkoutUrl) {
  throw new Error('Geen checkout URL ontvangen van Mollie');
}

redirect(checkoutUrl);
}
