insert into tours (
  slug,
  title,
  subtitle,
  description,
  language,
  duration_minutes,
  distance_km,
  mode,
  price_cents,
  is_active
)
values (
  'verborgen-verhalen-van-ameland',
  'Verborgen verhalen van Ameland',
  'Historie, zee en echte verhalen',
  'Ontdek Ameland op je eigen tempo met meeslepende verhalen van eilandbewoners.',
  'nl',
  75,
  14,
  'fiets',
  999,
  true
)
on conflict (slug) do nothing;
