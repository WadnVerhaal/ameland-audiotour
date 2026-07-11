-- Meertalige ondersteuning voor Ameland Audiotours
-- Talen: Nederlands, Duits, Engels

alter table if exists public.tours
add column if not exists title_nl text,
add column if not exists title_de text,
add column if not exists title_en text,
add column if not exists subtitle_nl text,
add column if not exists subtitle_de text,
add column if not exists subtitle_en text,
add column if not exists description_nl text,
add column if not exists description_de text,
add column if not exists description_en text;

alter table if exists public.tour_stops
add column if not exists title_nl text,
add column if not exists title_de text,
add column if not exists title_en text,
add column if not exists description_nl text,
add column if not exists description_de text,
add column if not exists description_en text,
add column if not exists audio_url_nl text,
add column if not exists audio_url_de text,
add column if not exists audio_url_en text;

-- Bestaande Nederlandse tourcontent veilig kopiëren naar de NL-velden
update public.tours
set
  title_nl = coalesce(title_nl, title),
  subtitle_nl = coalesce(subtitle_nl, subtitle),
  description_nl = coalesce(description_nl, description)
where
  title_nl is null
  or subtitle_nl is null
  or description_nl is null;

-- Bestaande Nederlandse stopcontent veilig kopiëren naar de NL-velden
update public.tour_stops
set
  title_nl = coalesce(title_nl, title),
  description_nl = coalesce(description_nl, description),
  audio_url_nl = coalesce(audio_url_nl, audio_url)
where
  title_nl is null
  or description_nl is null
  or audio_url_nl is null;
