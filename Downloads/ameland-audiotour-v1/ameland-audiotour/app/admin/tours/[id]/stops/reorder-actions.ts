'use server';

import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';

export async function moveStopAction(tourId: string, stopId: string, direction: 'up' | 'down') {
  const supabase = createServerSupabase();
  const { data: current } = await supabase.from('tour_stops').select('*').eq('id', stopId).single();
  if (!current) redirect(`/admin/tours/${tourId}/stops`);

  const { data: allStops } = await supabase
    .from('tour_stops')
    .select('*')
    .eq('tour_id', tourId)
    .order('order_index', { ascending: true });

  const stops = allStops ?? [];
  const index = stops.findIndex((stop) => stop.id === stopId);
  if (index === -1) redirect(`/admin/tours/${tourId}/stops`);

  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= stops.length) redirect(`/admin/tours/${tourId}/stops`);

  const currentStop = stops[index];
  const neighborStop = stops[swapIndex];

  await supabase.from('tour_stops').update({ order_index: -999 }).eq('id', currentStop.id);
  await supabase.from('tour_stops').update({ order_index: currentStop.order_index }).eq('id', neighborStop.id);
  await supabase.from('tour_stops').update({ order_index: neighborStop.order_index }).eq('id', currentStop.id);

  redirect(`/admin/tours/${tourId}/stops`);
}
