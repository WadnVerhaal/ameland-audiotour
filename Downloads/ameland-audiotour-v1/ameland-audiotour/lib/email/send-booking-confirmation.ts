import { Resend } from 'resend'
import {
  BookingConfirmationInput,
  buildBookingConfirmationEmail,
  normalizeLanguage,
} from './booking-confirmation'
import { amelandBrand } from '../brand'

function cleanUrl(url: string) {
  return url.replace(/\/+$/, '')
}

function addLanguageToUrl(url: string, language: string) {
  try {
    const parsed = new URL(url)
    if (!parsed.searchParams.get('lang')) parsed.searchParams.set('lang', language)
    return parsed.toString()
  } catch {
    return url
  }
}

function buildAccessUrlFromToken(token: string | null | undefined, language: string) {
  if (!token) return ''
  const pattern = process.env.ACCESS_LINK_PATTERN || process.env.TOUR_ACCESS_URL_PATTERN || ''

  if (pattern.includes('{token}')) {
    return addLanguageToUrl(
      pattern
        .replaceAll('{token}', encodeURIComponent(token))
        .replaceAll('{lang}', encodeURIComponent(language)),
      language
    )
  }

  const appUrl = cleanUrl(
    process.env.NEXT_PUBLIC_APP_URL ||
      process.env.PUBLIC_APP_URL ||
      'https://app.amelandaudiotours.nl'
  )
  return `${appUrl}/player/${encodeURIComponent(token)}?lang=${encodeURIComponent(language)}`
}

export async function sendBookingConfirmationEmail(rawInput: BookingConfirmationInput) {
  const language = normalizeLanguage(rawInput.language)
  const input: BookingConfirmationInput = {
    ...rawInput,
    language,
    accessUrl: rawInput.accessUrl || buildAccessUrlFromToken(rawInput.token, language),
  }

  if (!input.to) throw new Error('Geen ontvanger gevonden voor de bevestigingsmail.')
  if (!input.accessUrl) throw new Error('Geen tourlink gevonden voor de bevestigingsmail.')
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY ontbreekt in deze omgeving.')
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const built = buildBookingConfirmationEmail(input)
  const from =
    process.env.MAIL_FROM || `${amelandBrand.fromName} <${amelandBrand.fromEmail}>`
  const replyTo =
    process.env.MAIL_REPLY_TO || process.env.REPLY_TO_EMAIL || amelandBrand.fromEmail

  const result = await resend.emails.send({
    from,
    to: [input.to],
    replyTo,
    subject: built.subject,
    html: built.html,
    text: built.text,
    headers: input.orderId
      ? {
          'X-Entity-Ref-ID': String(input.orderId),
        }
      : undefined,
  })

  const response = result as unknown as {
    data?: { id?: string | null } | null
    error?: unknown
  }

  if (response.error) {
    const message =
      typeof response.error === 'object'
        ? JSON.stringify(response.error)
        : String(response.error)
    console.error('[booking-email] Provider rejected email', {
      orderId: input.orderId || null,
      language,
    })
    throw new Error(`Resend kon de boekingsmail niet verzenden: ${message}`)
  }

  console.log('[booking-email] Accepted', {
    providerId: response.data?.id || null,
    orderId: input.orderId || null,
    language,
  })

  return response
}

export const sendTourConfirmationEmail = sendBookingConfirmationEmail
export const sendOrderConfirmationEmail = sendBookingConfirmationEmail
export const sendTourAccessEmail = sendBookingConfirmationEmail
export const sendTourReadyEmail = sendBookingConfirmationEmail
export const sendAccessEmail = sendBookingConfirmationEmail
export const sendConfirmationEmail = sendBookingConfirmationEmail
export const sendBookingEmail = sendBookingConfirmationEmail
