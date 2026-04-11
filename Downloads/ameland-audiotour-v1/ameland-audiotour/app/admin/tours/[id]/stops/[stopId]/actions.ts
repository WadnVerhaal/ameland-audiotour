'use server';

import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { requireNonEmpty } from '@/lib/utils/text';

export async function updateStopAction(tourId: string, stopId: string, formData: FormData) {
  const supabase = createServerSupabase();
  const title = requireNonEmpty(formData.get('title'), 'Titel stop');
  const titleEn = String(formData.get('title_en') ?? '').trim() || null;
  const titleDe = String(formData.get('title_de') ?? '').trim() || null;

  const shortDescription = String(formData.get('short_description') ?? '').trim() || null;
  const shortDescriptionEn = String(formData.get('short_description_en') ?? '').trim() || null;
  const shortDescriptionDe = String(formData.get('short_description_de') ?? '').trim() || null;

  const audioUrl = String(formData.get('audio_url') ?? '').trim() || null;
  const imageUrl = String(formData.get('image_url') ?? '').trim() || null;
  const lat = Number(formData.get('lat') ?? 0);
  const lng = Number(formData.get('lng') ?? 0);
  const triggerRadius = Number(formData.get('trigger_radius_meters') ?? 70);
  const estimatedDuration = Number(formData.get('estimated_duration_seconds') ?? 180);
  const isActive = String(formData.get('is_active') ?? '') === 'on';

  const { error } = await supabase.from('tour_stops').update({
    title,
    title_en: titleEn,
    title_de: titleDe,
    short_description: shortDescription,
    short_description_en: shortDescriptionEn,
    short_description_de: shortDescriptionDe,
    audio_url: audioUrl,
    image_url: imageUrl,
    lat,
    lng,
    trigger_radius_meters: triggerRadius,
    estimated_duration_seconds: estimatedDuration,
    is_active: isActive,
  }).eq('id', stopId);

  if (error) throw error;
  redirect(`/admin/tours/${tourId}/stops/${stopId}`);
}

export async function deleteStopAction(tourId: string, stopId: string) {
  const supabase = createServerSupabase();
  const { error } = await supabase.from('tour_stops').delete().eq('id', stopId);
  if (error) throw error;
  redirect(`/admin/tours/${tourId}/stops`);
}