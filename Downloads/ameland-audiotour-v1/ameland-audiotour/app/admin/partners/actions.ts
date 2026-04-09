'use server';

import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { requireNonEmpty, slugify } from '@/lib/utils/text';

export async function createPartnerAction(formData: FormData) {
  const supabase = createServerSupabase();
  const name = requireNonEmpty(formData.get('name'), 'Naam');
  const partnerType = requireNonEmpty(formData.get('partner_type'), 'Type');
  const qrInput = String(formData.get('qr_slug') ?? '').trim();
  const qrSlug = qrInput || slugify(name);

  const { error } = await supabase.from('partners').insert({
    name,
    partner_type: partnerType,
    qr_slug: qrSlug,
    is_active: true,
  });

  if (error) throw error;
  redirect('/admin/partners');
}
