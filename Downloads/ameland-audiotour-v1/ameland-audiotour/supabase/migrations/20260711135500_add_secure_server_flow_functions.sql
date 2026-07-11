create or replace function public.resolve_tour_access(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_access public.access_tokens%rowtype;
  v_order public.orders%rowtype;
  v_tour public.tours%rowtype;
  v_stops jsonb;
begin
  select * into v_access from public.access_tokens where token = trim(p_token) limit 1;
  if not found then return null; end if;
  if v_access.expires_at is not null and v_access.expires_at <= now() then
    return jsonb_build_object('status', 'expired');
  end if;

  select * into v_order from public.orders
  where id = v_access.order_id and payment_status = 'paid' limit 1;
  if not found then return null; end if;

  select * into v_tour from public.tours
  where id = v_order.tour_id and is_active = true limit 1;
  if not found then return null; end if;

  select coalesce(jsonb_agg(to_jsonb(s) order by s.order_index), '[]'::jsonb)
  into v_stops
  from public.tour_stops s
  where s.tour_id = v_tour.id and s.is_active = true;
  if jsonb_array_length(v_stops) = 0 then return null; end if;

  update public.access_tokens set last_opened_at = now() where id = v_access.id;

  return jsonb_build_object(
    'status', 'ok',
    'access_token_id', v_access.id,
    'expires_at', v_access.expires_at,
    'order', jsonb_build_object(
      'id', v_order.id,
      'tour_id', v_order.tour_id,
      'email', v_order.email,
      'payment_status', v_order.payment_status
    ),
    'tour', to_jsonb(v_tour),
    'stops', v_stops
  );
end;
$$;

create or replace function public.register_tour_completion(
  p_token text,
  p_language text,
  p_duration_seconds integer,
  p_stops_completed integer,
  p_stops_total integer
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_access public.access_tokens%rowtype;
  v_order public.orders%rowtype;
  v_tour public.tours%rowtype;
  v_completion_id uuid;
  v_review_token text;
  v_new_token text := gen_random_uuid()::text;
  v_review_expires timestamptz := now() + interval '30 days';
begin
  select * into v_access from public.access_tokens where token = trim(p_token) limit 1;
  if not found then return null; end if;
  if v_access.expires_at is not null and v_access.expires_at <= now() then
    return jsonb_build_object('status', 'expired');
  end if;

  select * into v_order from public.orders
  where id = v_access.order_id and payment_status = 'paid' limit 1;
  if not found then return null; end if;

  select * into v_tour from public.tours
  where id = v_order.tour_id and is_active = true limit 1;
  if not found then return null; end if;

  insert into public.tour_completions (
    tour_id, tour_slug, order_id, access_token_id, email, language,
    duration_seconds, stops_total, stops_completed, completed_at
  ) values (
    v_tour.id,
    coalesce(v_tour.slug, v_tour.id::text),
    v_order.id,
    v_access.id,
    v_order.email,
    case when p_language in ('nl','en','de') then p_language else 'nl' end,
    greatest(0, least(coalesce(p_duration_seconds, 0), 86400)),
    greatest(0, least(coalesce(p_stops_total, 0), 250)),
    greatest(0, least(coalesce(p_stops_completed, 0), 250)),
    now()
  )
  on conflict (order_id) where order_id is not null
  do update set
    access_token_id = excluded.access_token_id,
    email = excluded.email,
    language = excluded.language,
    duration_seconds = excluded.duration_seconds,
    stops_total = excluded.stops_total,
    stops_completed = excluded.stops_completed,
    completed_at = excluded.completed_at
  returning id into v_completion_id;

  insert into public.review_tokens (order_id, token, expires_at)
  values (v_order.id, v_new_token, v_review_expires)
  on conflict (order_id)
  do update set
    token = case
      when public.review_tokens.expires_at <= now() then excluded.token
      else public.review_tokens.token
    end,
    expires_at = greatest(public.review_tokens.expires_at, excluded.expires_at),
    used_at = case
      when public.review_tokens.expires_at <= now() then null
      else public.review_tokens.used_at
    end
  returning token into v_review_token;

  update public.access_tokens set last_opened_at = now() where id = v_access.id;

  return jsonb_build_object(
    'status', 'ok',
    'completion_id', v_completion_id,
    'review_token', v_review_token,
    'order_id', v_order.id,
    'email', v_order.email,
    'access_expires_at', v_access.expires_at,
    'tour', jsonb_build_object(
      'id', v_tour.id,
      'slug', v_tour.slug,
      'title', v_tour.title,
      'title_nl', v_tour.title_nl,
      'title_en', v_tour.title_en,
      'title_de', v_tour.title_de
    )
  );
end;
$$;

create or replace function public.claim_aftersales_message(
  p_token text,
  p_message_type text,
  p_scheduled_for timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order_id uuid;
  v_completion_id uuid;
  v_message_id uuid;
  v_existing public.aftersales_messages%rowtype;
begin
  if p_message_type not in ('completion', 'review_reminder') then
    raise exception 'Unsupported message type';
  end if;

  select o.id into v_order_id
  from public.access_tokens a
  join public.orders o on o.id = a.order_id and o.payment_status = 'paid'
  where a.token = trim(p_token)
    and (a.expires_at is null or a.expires_at > now())
  limit 1;
  if v_order_id is null then return null; end if;

  select id into v_completion_id from public.tour_completions
  where order_id = v_order_id limit 1;
  if v_completion_id is null then return null; end if;

  insert into public.aftersales_messages (
    order_id, completion_id, message_type, status, scheduled_for, attempts, updated_at
  ) values (
    v_order_id, v_completion_id, p_message_type, 'processing', p_scheduled_for, 1, now()
  )
  on conflict (order_id, message_type) do nothing
  returning id into v_message_id;
  if v_message_id is not null then return v_message_id; end if;

  select * into v_existing from public.aftersales_messages
  where order_id = v_order_id and message_type = p_message_type limit 1;

  if found and v_existing.status = 'failed' and v_existing.attempts < 3 then
    update public.aftersales_messages
    set status = 'processing', scheduled_for = p_scheduled_for,
        attempts = attempts + 1, last_error = null, updated_at = now()
    where id = v_existing.id
    returning id into v_message_id;
    return v_message_id;
  end if;

  return null;
end;
$$;

create or replace function public.finish_aftersales_message(
  p_token text,
  p_message_type text,
  p_status text,
  p_provider_id text default null,
  p_error text default null,
  p_scheduled_for timestamptz default null
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_order_id uuid;
begin
  if p_message_type not in ('completion', 'review_reminder') then return false; end if;
  if p_status not in ('sent', 'scheduled', 'failed') then return false; end if;

  select o.id into v_order_id
  from public.access_tokens a
  join public.orders o on o.id = a.order_id and o.payment_status = 'paid'
  where a.token = trim(p_token) limit 1;
  if v_order_id is null then return false; end if;

  update public.aftersales_messages
  set status = p_status,
      provider_id = p_provider_id,
      scheduled_for = p_scheduled_for,
      sent_at = case when p_status = 'sent' then now() else sent_at end,
      last_error = left(p_error, 1000),
      updated_at = now()
  where order_id = v_order_id and message_type = p_message_type;
  return found;
end;
$$;

create or replace function public.resolve_review_access(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_review_token public.review_tokens%rowtype;
  v_order public.orders%rowtype;
  v_tour public.tours%rowtype;
  v_review public.reviews%rowtype;
  v_review_json jsonb := null;
begin
  select * into v_review_token from public.review_tokens
  where token = trim(p_token) limit 1;
  if not found then return null; end if;
  if v_review_token.expires_at <= now() then
    return jsonb_build_object('status', 'expired');
  end if;

  select * into v_order from public.orders
  where id = v_review_token.order_id and payment_status = 'paid' limit 1;
  if not found then return null; end if;

  select * into v_tour from public.tours where id = v_order.tour_id limit 1;
  if not found then return null; end if;

  select * into v_review from public.reviews where order_id = v_order.id limit 1;
  if found then
    v_review_json := jsonb_build_object(
      'id', v_review.id,
      'rating', v_review.rating,
      'review_text', v_review.review_text
    );
  end if;

  return jsonb_build_object(
    'status', 'ok',
    'order_id', v_order.id,
    'tour_id', v_order.tour_id,
    'used_at', v_review_token.used_at,
    'tour', jsonb_build_object(
      'title', v_tour.title,
      'title_nl', v_tour.title_nl,
      'title_en', v_tour.title_en,
      'title_de', v_tour.title_de
    ),
    'review', v_review_json
  );
end;
$$;

create or replace function public.submit_review_with_token(
  p_token text,
  p_rating integer,
  p_review_text text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_review_token public.review_tokens%rowtype;
  v_order public.orders%rowtype;
  v_tour public.tours%rowtype;
  v_review_id uuid;
begin
  if p_rating < 1 or p_rating > 5 then raise exception 'Invalid rating'; end if;

  select * into v_review_token from public.review_tokens
  where token = trim(p_token) and expires_at > now() limit 1;
  if not found then return null; end if;

  select * into v_order from public.orders
  where id = v_review_token.order_id and payment_status = 'paid' limit 1;
  if not found then return null; end if;

  select * into v_tour from public.tours where id = v_order.tour_id limit 1;
  if not found then return null; end if;

  insert into public.reviews (tour_id, order_id, rating, review_text)
  values (
    v_order.tour_id,
    v_order.id,
    p_rating,
    nullif(left(trim(coalesce(p_review_text, '')), 3000), '')
  )
  on conflict (order_id) where order_id is not null
  do update set rating = excluded.rating, review_text = excluded.review_text
  returning id into v_review_id;

  update public.review_tokens set used_at = now() where id = v_review_token.id;

  return jsonb_build_object(
    'status', 'ok',
    'review_id', v_review_id,
    'order_id', v_order.id,
    'tour', jsonb_build_object(
      'title', v_tour.title,
      'title_nl', v_tour.title_nl,
      'title_en', v_tour.title_en,
      'title_de', v_tour.title_de
    )
  );
end;
$$;

create or replace function public.claim_low_rating_alert(p_review_token text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order_id uuid;
  v_completion_id uuid;
  v_message_id uuid;
  v_existing public.aftersales_messages%rowtype;
begin
  select o.id into v_order_id
  from public.review_tokens r
  join public.orders o on o.id = r.order_id and o.payment_status = 'paid'
  where r.token = trim(p_review_token) and r.expires_at > now()
  limit 1;
  if v_order_id is null then return null; end if;

  select id into v_completion_id from public.tour_completions
  where order_id = v_order_id limit 1;

  insert into public.aftersales_messages (
    order_id, completion_id, message_type, status, attempts, updated_at
  ) values (
    v_order_id, v_completion_id, 'low_rating_alert', 'processing', 1, now()
  )
  on conflict (order_id, message_type) do nothing
  returning id into v_message_id;
  if v_message_id is not null then return v_message_id; end if;

  select * into v_existing from public.aftersales_messages
  where order_id = v_order_id and message_type = 'low_rating_alert' limit 1;
  if found and v_existing.status = 'failed' and v_existing.attempts < 3 then
    update public.aftersales_messages
    set status = 'processing', attempts = attempts + 1,
        last_error = null, updated_at = now()
    where id = v_existing.id
    returning id into v_message_id;
    return v_message_id;
  end if;
  return null;
end;
$$;

create or replace function public.finish_low_rating_alert(
  p_review_token text,
  p_status text,
  p_provider_id text default null,
  p_error text default null
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_order_id uuid;
begin
  if p_status not in ('sent', 'failed') then return false; end if;

  select o.id into v_order_id
  from public.review_tokens r
  join public.orders o on o.id = r.order_id and o.payment_status = 'paid'
  where r.token = trim(p_review_token) limit 1;
  if v_order_id is null then return false; end if;

  update public.aftersales_messages
  set status = p_status,
      provider_id = p_provider_id,
      sent_at = case when p_status = 'sent' then now() else sent_at end,
      last_error = left(p_error, 1000),
      updated_at = now()
  where order_id = v_order_id and message_type = 'low_rating_alert';
  return found;
end;
$$;

revoke all on function public.resolve_tour_access(text) from public;
revoke all on function public.register_tour_completion(text,text,integer,integer,integer) from public;
revoke all on function public.claim_aftersales_message(text,text,timestamptz) from public;
revoke all on function public.finish_aftersales_message(text,text,text,text,text,timestamptz) from public;
revoke all on function public.resolve_review_access(text) from public;
revoke all on function public.submit_review_with_token(text,integer,text) from public;
revoke all on function public.claim_low_rating_alert(text) from public;
revoke all on function public.finish_low_rating_alert(text,text,text,text) from public;

grant execute on function public.resolve_tour_access(text) to anon, authenticated, service_role;
grant execute on function public.register_tour_completion(text,text,integer,integer,integer) to anon, authenticated, service_role;
grant execute on function public.claim_aftersales_message(text,text,timestamptz) to anon, authenticated, service_role;
grant execute on function public.finish_aftersales_message(text,text,text,text,text,timestamptz) to anon, authenticated, service_role;
grant execute on function public.resolve_review_access(text) to anon, authenticated, service_role;
grant execute on function public.submit_review_with_token(text,integer,text) to anon, authenticated, service_role;
grant execute on function public.claim_low_rating_alert(text) to anon, authenticated, service_role;
grant execute on function public.finish_low_rating_alert(text,text,text,text) to anon, authenticated, service_role;
