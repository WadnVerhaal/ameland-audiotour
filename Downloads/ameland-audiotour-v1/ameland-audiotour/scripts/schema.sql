create extension if not exists pgcrypto;

create table if not exists tours (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  description text not null,
  language text not null default 'nl',
  duration_minutes integer not null default 60,
  distance_km numeric(5,2) not null default 0,
  mode text not null default 'fiets',
  price_cents integer not null,
  hero_image_url text,
  start_lat numeric(10,7),
  start_lng numeric(10,7),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tour_stops (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references tours(id) on delete cascade,
  order_index integer not null,
  title text not null,
  short_description text,
  audio_url text,
  image_url text,
  lat numeric(10,7),
  lng numeric(10,7),
  trigger_radius_meters integer not null default 70,
  estimated_duration_seconds integer not null default 180,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tour_id, order_index)
);

create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  partner_type text not null,
  qr_slug text unique not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references tours(id) on delete restrict,
  email text not null,
  partner_id uuid references partners(id) on delete set null,
  payment_status text not null default 'pending',
  payment_provider text not null default 'mollie',
  payment_reference text,
  amount_cents integer not null,
  created_at timestamptz not null default now()
);

create table if not exists access_tokens (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references orders(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz,
  last_opened_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid not null references tours(id) on delete cascade,
  order_id uuid references orders(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  review_text text,
  created_at timestamptz not null default now()
);

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  event_name text not null,
  tour_id uuid references tours(id) on delete set null,
  partner_id uuid references partners(id) on delete set null,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tours_set_updated_at on tours;
create trigger tours_set_updated_at
before update on tours
for each row execute procedure set_updated_at();

drop trigger if exists tour_stops_set_updated_at on tour_stops;
create trigger tour_stops_set_updated_at
before update on tour_stops
for each row execute procedure set_updated_at();

create index if not exists idx_tour_stops_tour_id on tour_stops(tour_id);
create index if not exists idx_orders_tour_id on orders(tour_id);
create index if not exists idx_orders_partner_id on orders(partner_id);
alter table tour_stops
add column if not exists title_en text,
add column if not exists title_de text,
add column if not exists short_description_en text,
add column if not exists short_description_de text;
