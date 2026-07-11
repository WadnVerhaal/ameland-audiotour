'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabase } from '@/lib/supabase/server'

const allowedStatuses = new Set(['open', 'in_progress', 'resolved'])

export async function updateSupportStatus(formData: FormData) {
  const id = String(formData.get('id') || '')
  const status = String(formData.get('status') || '')
  if (!/^[0-9a-f-]{36}$/i.test(id) || !allowedStatuses.has(status)) return

  const supabase = createServerSupabase()
  await supabase
    .from('support_requests')
    .update({
      status,
      resolved_at: status === 'resolved' ? new Date().toISOString() : null,
    })
    .eq('id', id)

  revalidatePath('/admin/support')
}
