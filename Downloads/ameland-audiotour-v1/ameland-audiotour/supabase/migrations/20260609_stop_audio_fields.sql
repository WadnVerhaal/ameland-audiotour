alter table public.tour_stops
  add column if not exists audio_url text,
  add column if not exists audio_url_nl text,
  add column if not exists audio_url_en text,
  add column if not exists audio_url_de text,
  add column if not exists audio_text_nl text,
  add column if not exists audio_text_en text,
  add column if not exists audio_text_de text,
  add column if not exists trigger_radius_meters integer default 25;

comment on column public.tour_stops.audio_url is 'Fallback audio URL for this stop.';
comment on column public.tour_stops.audio_url_nl is 'Dutch audio URL for this stop.';
comment on column public.tour_stops.audio_url_en is 'English audio URL for this stop.';
comment on column public.tour_stops.audio_url_de is 'German audio URL for this stop.';
comment on column public.tour_stops.audio_text_nl is 'Dutch fallback text for browser speech if no audio URL exists.';
comment on column public.tour_stops.audio_text_en is 'English fallback text for browser speech if no audio URL exists.';
comment on column public.tour_stops.audio_text_de is 'German fallback text for browser speech if no audio URL exists.';
comment on column public.tour_stops.trigger_radius_meters is 'Distance in meters at which this stop audio may start.';
