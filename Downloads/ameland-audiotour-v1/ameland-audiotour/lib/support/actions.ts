import crypto from 'node:crypto'
import type { AppLanguage } from '@/lib/app-language'
import { sendAccessEmail, sendSupportNotification } from '@/lib/mail/send-access-email'
import { createServerSupabase } from '@/lib/supabase/server'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

export async function checkOrderStatus(input: { email: string; orderId: string }) {
  const email = normalizeEmail(input.email)
  if (!EMAIL_PATTERN.test(email)) return { status: 'invalid_input' as const }

  const supabase = createServerSupabase()
  const { data: order } = await supabase
    .from('orders')
    .select('id, payment_status, created_at, tours(title)')
    .eq('id', input.orderId)
    .ilike('email', email)
    .maybeSingle()

  if (!order) return { status: 'not_found' as const }

  const tour = Array.isArray(order.tours) ? order.tours[0] : order.tours
  return {
    status: 'found' as const,
    paymentStatus: String(order.payment_status),
    tourTitle: tour && 'title' in tour ? String(tour.title) : 'Ameland Audiotour',
    orderedAt: String(order.created_at),
  }
}

export async function resendAccessLink(input: {
  email: string
  orderId?: string
  language: AppLanguage
}) {
  const email = normalizeEmail(input.email)
  if (!EMAIL_PATTERN.test(email)) return { status: 'invalid_input' as const }

  const supabase = createServerSupabase()
  let query = supabase
    .from('orders')
    .select('id, payment_status, tours(title)')
    .ilike('email', email)
    .eq('payment_status', 'paid')
    .order('created_at', { ascending: false })
    .limit(1)

  if (input.orderId) query = query.eq('id', input.orderId)

  const { data: orders } = await query
  const order = orders?.[0]
  if (!order) {
    return input.orderId
      ? { status: 'not_found' as const }
      : { status: 'processed_privately' as const }
  }

  const { data: tokenRow } = await supabase
    .from('access_tokens')
    .select('token, expires_at')
    .eq('order_id', order.id)
    .maybeSingle()

  if (!tokenRow?.token) {
    return input.orderId
      ? { status: 'not_ready' as const }
      : { status: 'processed_privately' as const }
  }

  if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) {
    return input.orderId
      ? { status: 'expired' as const }
      : { status: 'processed_privately' as const }
  }

  const tour = Array.isArray(order.tours) ? order.tours[0] : order.tours
  const tourTitle = tour && 'title' in tour ? String(tour.title) : 'Ameland Audiotour'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.amelandaudiotours.nl'

  await sendAccessEmail({
    to: email,
    tourTitle,
    accessUrl: `${appUrl.replace(/\/$/, '')}/access/${tokenRow.token}?lang=${input.language}`,
    language: input.language,
  })

  return input.orderId
    ? { status: 'sent' as const }
    : { status: 'processed_privately' as const }
}

export async function createSupportRequest(input: {
  category: 'payment' | 'access' | 'location' | 'audio' | 'route' | 'other'
  summary: string
  language: AppLanguage
  pageContext: string
  email?: string
  orderId?: string
}) {
  const normalizedEmail = input.email ? normalizeEmail(input.email) : null
  const email = normalizedEmail && EMAIL_PATTERN.test(normalizedEmail) ? normalizedEmail : null
  const summary = input.summary.trim().slice(0, 1200)
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('support_requests')
    .insert({
      category: input.category,
      summary,
      locale: input.language,
      page_context: input.pageContext.slice(0, 160),
      customer_email: email,
      order_id: input.orderId || null,
      status: 'open',
    })
    .select('id')
    .single()

  if (error || !data) throw new Error('Support request could not be saved')

  await sendSupportNotification({
    reference: String(data.id),
    category: input.category,
    summary,
    email,
    orderId: input.orderId || null,
    pageContext: input.pageContext,
  }).catch((error) => console.error('Support notification failed', error))

  return { status: 'created' as const, reference: String(data.id).slice(0, 8).toUpperCase() }
}

export async function getPageSupportState(pathname: string) {
  const cleanPath = pathname.split('?')[0]
  const parts = cleanPath.split('/').filter(Boolean)
  const section = parts[0] || 'home'
  const supabase = createServerSupabase()

  if (section === 'success' && parts[1] && /^[0-9a-f-]{36}$/i.test(parts[1])) {
    const { data } = await supabase
      .from('orders')
      .select('payment_status')
      .eq('id', parts[1])
      .maybeSingle()
    return `checkout result page; payment state: ${data?.payment_status || 'unknown'}`
  }

  if (['access', 'player', 'review'].includes(section) && parts[1]) {
    const { data } = await supabase
      .from('access_tokens')
      .select('expires_at')
      .eq('token', parts[1])
      .maybeSingle()
    if (!data) return `${section} page; access state: invalid`
    const expired = data.expires_at && new Date(data.expires_at) < new Date()
    return `${section} page; access state: ${expired ? 'expired' : 'active'}`
  }

  const knownSections: Record<string, string> = {
    home: 'app home page',
    tours: 'tour overview or detail page',
    checkout: 'checkout page before Mollie payment',
    privacy: 'privacy page',
    voorwaarden: 'terms page',
  }
  return knownSections[section] || 'website or app page'
}

export async function enforceSupportRateLimit(ip: string) {
  const salt = process.env.SUPPORT_RATE_LIMIT_SALT || 'skipper-hidde-rate-limit-v1'
  const ipHash = crypto.createHash('sha256').update(`${salt}:${ip}`).digest('hex')
  const supabase = createServerSupabase()
  const windowStart = new Date(Date.now() - 10 * 60 * 1000).toISOString()

  const { count } = await supabase
    .from('support_rate_limits')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', windowStart)

  if ((count || 0) >= 20) return false

  await supabase.from('support_rate_limits').insert({ ip_hash: ipHash })
  await supabase
    .from('support_rate_limits')
    .delete()
    .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
  return true
}
