'use server';

import { redirect } from 'next/navigation';
import { updateTourAdmin } from '@/lib/data/admin';

export async function updateTourAction(id: string, formData: FormData) {
  await updateTourAdmin(id, formData);
  redirect(`/admin/tours/${id}`);
}
