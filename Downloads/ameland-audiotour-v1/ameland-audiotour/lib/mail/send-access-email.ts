import { sendBookingConfirmationEmail } from '@/lib/email/send-booking-confirmation'

export type SendAccessEmailInput = {
  to?: string | null
  email?: string | null
  customerEmail?: string | null
  customer_email?: string | null

  language?: string | null
  locale?: string | null
  lang?: string | null

  tourTitle?: string | null
  title?: string | null
  tourDescription?: string | null
  description?: string | null

  accessUrl?: string | null
  access_url?: string | null
  accessLink?: string | null
  access_link?: string | null
  playerUrl?: string | null
  player_url?: string | null
  startUrl?: string | null
  start_url?: string | null
  link?: string | null
  url?: string | null

  token?: string | null
  accessToken?: string | null
  access_token?: string | null

  expiresAt?: string | Date | null
  expires_at?: string | Date | null
  validUntil?: string | Date | null
  valid_until?: string | Date | null

  orderId?: string | null
  order_id?: string | null
  id?: string | null

  duration?: string | number | null
  distance?: string | number | null

  tour?: Record<string, unknown> | null
  order?: Record<string, unknown> | null

  [key: string]: unknown
}

function isPresent(value: unknown) {
  return value !== undefined && value !== null && String(value).trim() !== ''
}

function firstValue(...values: unknown[]) {
  return values.find(isPresent)
}

function asString(value: unknown, fallback = '') {
  return isPresent(value) ? String(value) : fallback
}

function asObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }

  return {}
}

export async function sendAccessEmail(input: SendAccessEmailInput) {
  const order = asObject(input.order)
  const tour = asObject(input.tour)

  const to = firstValue(
    input.to,
    input.email,
    input.customerEmail,
    input.customer_email,
    order.email,
    order.customer_email
  )

  const accessUrl = firstValue(
    input.accessUrl,
    input.access_url,
    input.accessLink,
    input.access_link,
    input.playerUrl,
    input.player_url,
    input.startUrl,
    input.start_url,
    input.link,
    input.url
  )

  const token = firstValue(
    input.token,
    input.accessToken,
    input.access_token,
    order.token,
    order.access_token
  )

  const language = firstValue(
    input.language,
    input.locale,
    input.lang,
    order.language,
    order.locale,
    order.lang
  )

  const tourTitle = firstValue(
    input.tourTitle,
    input.title,
    tour.title,
    tour.name,
    tour.title_nl,
    tour.title_en,
    tour.title_de,
    'Ameland Audiotour'
  )

  const tourDescription = firstValue(
    input.tourDescription,
    input.description,
    tour.description,
    tour.description_nl,
    tour.description_en,
    tour.description_de
  )

  const expiresAt = firstValue(
    input.expiresAt,
    input.expires_at,
    input.validUntil,
    input.valid_until,
    order.expires_at
  )

  const orderId = firstValue(
    input.orderId,
    input.order_id,
    input.id,
    order.id
  )

  console.log('[sendAccessEmail] branded mail requested', {
    hasRecipient: Boolean(to),
    hasAccessUrl: Boolean(accessUrl),
    hasToken: Boolean(token),
    language: asString(language, 'nl'),
    tourTitle: asString(tourTitle, 'Ameland Audiotour'),
    orderId: asString(orderId, ''),
  })

  return sendBookingConfirmationEmail({
    to: asString(to),
    language: asString(language, 'nl'),
    tourTitle: asString(tourTitle, 'Ameland Audiotour'),
    tourDescription: asString(tourDescription, ''),
    duration: input.duration || '90 min',
    distance: input.distance || '± 6,5 km',
    accessUrl: asString(accessUrl),
    token: asString(token),
    expiresAt: expiresAt as string | Date | null | undefined,
    orderId: asString(orderId),
  })
}

export const sendTourAccessEmail = sendAccessEmail
export const sendOrderAccessEmail = sendAccessEmail
export const sendConfirmationEmail = sendAccessEmail
export const sendTourConfirmationEmail = sendAccessEmail
