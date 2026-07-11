alter table public.tour_completions
  add column if not exists order_id uuid references public.orders(id) on delete set null,
  add column if not exists language text,
  add column if not exists access_token_id uuid references public.access_tokens(id) on delete set null;

create unique index if not exists tour_completions_order_id_unique
  on public.tour_completions(order_id)
  where order_id is not null;

create unique index if not exists reviews_order_id_unique
  on public.reviews(order_id)
  where order_id is not null;

create table if not exists public.review_tokens (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.aftersales_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  completion_id uuid references public.tour_completions(id) on delete cascade,
  message_type text not null check (message_type in ('completion', 'review_reminder', 'low_rating_alert')),
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'scheduled', 'failed', 'skipped')),
  provider_id text,
  scheduled_for timestamptz,
  sent_at timestamptz,
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(order_id, message_type)
);

alter table public.review_tokens enable row level security;
alter table public.aftersales_messages enable row level security;

revoke all on table public.review_tokens from anon, authenticated;
revoke all on table public.aftersales_messages from anon, authenticated;
grant all on table public.review_tokens to service_role;
grant all on table public.aftersales_messages to service_role;

create policy "No public access to review tokens"
on public.review_tokens
for all
to anon, authenticated
using (false)
with check (false);

create policy "No public access to aftersales messages"
on public.aftersales_messages
for all
to anon, authenticated
using (false)
with check (false);

create index if not exists review_tokens_token_idx on public.review_tokens(token);
create index if not exists aftersales_messages_status_idx on public.aftersales_messages(status, scheduled_for);
create index if not exists aftersales_messages_completion_idx on public.aftersales_messages(completion_id);
