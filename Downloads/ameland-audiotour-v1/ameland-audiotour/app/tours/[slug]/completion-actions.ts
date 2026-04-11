'use server';

import { createServerSupabase } from '@/lib/supabase/server';

export async function saveTourCompletion(input: {
  tourId: string;
  tourSlug: string;
  email?: string | null;
  durationSeconds?: number | null;
  distanceKm?: number | null;
  stopsTotal?: number | null;
  stopsCompleted?: number | null;
}) {
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from('tour_completions')
    .insert({
      tour_id: input.tourId,
      tour_slug: input.tourSlug,
      email: input.email ?? null,
      duration_seconds: input.durationSeconds ?? null,
      distance_km: input.distanceKm ?? null,
      stops_total: input.stopsTotal ?? null,
      stops_completed: input.stopsCompleted ?? null,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Kon tourafronding niet opslaan: ${error.message}`);
  }

  return data;
}

export async function saveTourFeedback(input: {
  tourId: string;
  completionId?: string | null;
  rating: number;
  feedbackText?: string | null;
  recommendation?: 'yes' | 'maybe' | 'no' | null;
  favoritePart?: string | null;
}) {
  const supabase = createServerSupabase();

  const { error } = await supabase.from('tour_feedback').insert({
    tour_id: input.tourId,
    completion_id: input.completionId ?? null,
    rating: input.rating,
    feedback_text: input.feedbackText ?? null,
    recommendation: input.recommendation ?? null,
    favorite_part: input.favoritePart ?? null,
  });

  if (error) {
    throw new Error(`Kon feedback niet opslaan: ${error.message}`);
  }

  return { success: true };
}