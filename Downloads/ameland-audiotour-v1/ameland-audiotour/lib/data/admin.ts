import { createServerSupabase } from '@/lib/supabase/server';
import { parseEuroInputToCents } from '@/lib/utils/money';
import { requireNonEmpty, slugify } from '@/lib/utils/text';

export async function getAllToursAdmin() {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getTourAdmin(id: string) {
  const supabase = createServerSupabase();
  const { data, error } = await supabase.from('tours').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function getStopsAdmin(tourId: string) {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('tour_stops')
    .select('*')
    .eq('tour_id', tourId)
    .order('order_index', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getOrdersAdmin() {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('orders')
    .select('*, tours(title), partners(name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getReviewsAdmin() {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('reviews')
    .select('*, tours(title)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getPartnersAdmin() {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createTourAdmin(formData: FormData) {
  const supabase = createServerSupabase();
  const title = requireNonEmpty(formData.get('title'), 'Titel');
  const slugInput = String(formData.get('slug') ?? '').trim();
  const slug = slugInput || slugify(title);
  const description = requireNonEmpty(formData.get('description'), 'Beschrijving');
  const priceCents = parseEuroInputToCents(requireNonEmpty(formData.get('price'), 'Prijs'));
  const subtitle = String(formData.get('subtitle') ?? '').trim() || null;
  const language = String(formData.get('language') ?? 'nl').trim() || 'nl';
  const mode = String(formData.get('mode') ?? 'fiets').trim() || 'fiets';
  const duration = Number(formData.get('duration_minutes') ?? 60);
  const distance = Number(formData.get('distance_km') ?? 0);
  const isActive = String(formData.get('is_active') ?? '') === 'on';

  const { error } = await supabase.from('tours').insert({
    title,
    slug,
    description,
    subtitle,
    language,
    mode,
    duration_minutes: duration,
    distance_km: distance,
    price_cents: priceCents,
    is_active: isActive,
  });

  if (error) throw error;
}

export async function updateTourAdmin(id: string, formData: FormData) {
  const supabase = createServerSupabase();
  const title = requireNonEmpty(formData.get('title'), 'Titel');
  const slugInput = String(formData.get('slug') ?? '').trim();
  const slug = slugInput || slugify(title);
  const description = requireNonEmpty(formData.get('description'), 'Beschrijving');
  const priceCents = parseEuroInputToCents(requireNonEmpty(formData.get('price'), 'Prijs'));
  const subtitle = String(formData.get('subtitle') ?? '').trim() || null;
  const language = String(formData.get('language') ?? 'nl').trim() || 'nl';
  const mode = String(formData.get('mode') ?? 'fiets').trim() || 'fiets';
  const duration = Number(formData.get('duration_minutes') ?? 60);
  const distance = Number(formData.get('distance_km') ?? 0);
  const isActive = String(formData.get('is_active') ?? '') === 'on';

  const { error } = await supabase
    .from('tours')
    .update({
      title,
      slug,
      description,
      subtitle,
      language,
      mode,
      duration_minutes: duration,
      distance_km: distance,
      price_cents: priceCents,
      is_active: isActive,
    })
    .eq('id', id);

  if (error) throw error;
}

export async function createStopAdmin(tourId: string, formData: FormData) {
  const supabase = createServerSupabase();

  const title = requireNonEmpty(formData.get('title'), 'Titel stop');
  const titleEn = String(formData.get('title_en') ?? '').trim() || null;
  const titleDe = String(formData.get('title_de') ?? '').trim() || null;

  const shortDescription = String(formData.get('short_description') ?? '').trim() || null;
  const shortDescriptionEn = String(formData.get('short_description_en') ?? '').trim() || null;
  const shortDescriptionDe = String(formData.get('short_description_de') ?? '').trim() || null;

  const audioUrl = String(formData.get('audio_url') ?? '').trim() || null;
  const audioUrlNl = String(formData.get('audio_url_nl') ?? '').trim() || null;
  const audioUrlEn = String(formData.get('audio_url_en') ?? '').trim() || null;
  const audioUrlDe = String(formData.get('audio_url_de') ?? '').trim() || null;

  const imageUrl = String(formData.get('image_url') ?? '').trim() || null;
  const lat = Number(formData.get('lat') ?? 0);
  const lng = Number(formData.get('lng') ?? 0);
  const triggerRadius = Number(formData.get('trigger_radius_meters') ?? 70);
  const estimatedDuration = Number(formData.get('estimated_duration_seconds') ?? 180);

  const { data: existingStops } = await supabase
    .from('tour_stops')
    .select('order_index')
    .eq('tour_id', tourId)
    .order('order_index', { ascending: false })
    .limit(1);

  const nextOrder = existingStops?.[0]?.order_index ? existingStops[0].order_index + 1 : 1;

  const { error } = await supabase.from('tour_stops').insert({
    tour_id: tourId,
    order_index: nextOrder,
    title,
    title_en: titleEn,
    title_de: titleDe,
    short_description: shortDescription,
    short_description_en: shortDescriptionEn,
    short_description_de: shortDescriptionDe,
    audio_url: audioUrl,
    audio_url_nl: audioUrlNl,
    audio_url_en: audioUrlEn,
    audio_url_de: audioUrlDe,
    image_url: imageUrl,
    lat,
    lng,
    trigger_radius_meters: triggerRadius,
    estimated_duration_seconds: estimatedDuration,
    is_active: true,
  });

  if (error) throw error;
}