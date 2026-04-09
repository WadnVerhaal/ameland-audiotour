'use server';

import { redirect } from 'next/navigation';
import { createTourAdmin } from '@/lib/data/admin';

export async function createTourAction(formData: FormData) {
  await createTourAdmin(formData);
  redirect('/admin/tours');
}
