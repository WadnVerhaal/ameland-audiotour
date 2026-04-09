'use server';

import { redirect } from 'next/navigation';
import { createStopAdmin } from '@/lib/data/admin';

export async function createStopAction(tourId: string, formData: FormData) {
  await createStopAdmin(tourId, formData);
  redirect(`/admin/tours/${tourId}/stops`);
}
