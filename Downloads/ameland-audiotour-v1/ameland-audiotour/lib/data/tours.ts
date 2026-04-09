import { createServerSupabase } from '@/lib/supabase/server';
import { Tour, TourStop, TourWithStops } from '@/types/tour';

export async function getActiveTours(): Promise<Tour[]> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Tour[];
}

export async function getTourBySlug(slug: string): Promise<TourWithStops | null> {
  const supabase = createServerSupabase();
  const { data: tour, error: tourError } = await supabase
    .from('tours')
    .select('*')
    .eq('slug', slug)
    .single();

  if (tourError || !tour) return null;

  const { data: stops, error: stopsError } = await supabase
    .from('tour_stops')
    .select('*')
    .eq('tour_id', tour.id)
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (stopsError) throw stopsError;

  return {
    ...(tour as Tour),
    stops: (stops ?? []) as TourStop[],
  };
}
