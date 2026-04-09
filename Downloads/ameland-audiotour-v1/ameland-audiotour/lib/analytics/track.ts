import { createServerSupabase } from '@/lib/supabase/server';

export async function trackEvent(input: {
  sessionId?: string;
  eventName: string;
  tourId?: string;
  partnerId?: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createServerSupabase();
  await supabase.from('analytics_events').insert({
    session_id: input.sessionId ?? null,
    event_name: input.eventName,
    tour_id: input.tourId ?? null,
    partner_id: input.partnerId ?? null,
    metadata_json: input.metadata ?? {},
  });
}
