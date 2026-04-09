import { NextRequest, NextResponse } from 'next/server';
import { mollie } from '@/lib/mollie/client';
import { createServerSupabase } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const paymentId = String(formData.get('id') || '');
  if (!paymentId) return NextResponse.json({ ok: false }, { status: 400 });

  const payment = await mollie().payments.get(paymentId);
  const metadata = payment.metadata as { orderId?: string } | undefined;
const orderId = String(metadata?.orderId || '');
  if (!orderId) return NextResponse.json({ ok: false }, { status: 400 });

  let status = 'pending';
  if (payment.isPaid()) status = 'paid';
  if (payment.isFailed()) status = 'failed';
  if (payment.isExpired()) status = 'expired';

  const supabase = createServerSupabase();
  await supabase.from('orders').update({ payment_status: status }).eq('id', orderId);

  return NextResponse.json({ ok: true });
}
