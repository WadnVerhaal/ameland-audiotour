import { Resend } from 'resend'
import { amelandBrand } from '@/lib/brand'

export type AftersalesLanguage = 'nl' | 'en' | 'de'

type CustomerEmailInput = {
  to: string
  language: AftersalesLanguage
  tourTitle: string
  accessUrl: string
  reviewUrl: string
  orderId: string
  scheduledAt?: string
}

type LowRatingAlertInput = {
  orderId: string
  tourTitle: string
  rating: number
  feedback?: string | null
}

const copy = {
  nl: {
    completedSubject: (title: string) => `Bedankt voor je wandeling: ${title}`,
    completedPreview: 'Je tour is afgerond. Luister terug of deel je ervaring.',
    completedTitle: 'Bedankt dat je met ons op pad ging',
    completedText:
      'Je hebt de audiotour afgerond. We hopen dat je Hollum nu met andere ogen bekijkt.',
    reviewTitle: 'Hoe was je ervaring?',
    reviewText: 'Met een korte beoordeling help je ons de route beter te maken.',
    reviewButton: 'Geef je beoordeling',
    accessText: 'Je persoonlijke tourlink blijft actief tot de aangegeven vervaldatum.',
    accessButton: 'Luister nog eens terug',
    support: 'Werkt iets niet goed? Antwoord op deze e-mail. We helpen je persoonlijk.',
    reminderSubject: (title: string) => `Hoe vond je ${title}?`,
    reminderPreview: 'Een korte beoordeling helpt ons en andere bezoekers.',
    reminderTitle: 'Mogen we je één vraag stellen?',
    reminderText:
      'Hoe heb je de audiotour ervaren? Een beoordeling duurt minder dan een minuut. Heb je al gereageerd, dan hoef je niets meer te doen.',
  },
  en: {
    completedSubject: (title: string) => `Thank you for walking with us: ${title}`,
    completedPreview: 'Your tour is complete. Listen again or share your experience.',
    completedTitle: 'Thank you for exploring with us',
    completedText:
      'You have completed the audio tour. We hope you now see Hollum through different eyes.',
    reviewTitle: 'How was your experience?',
    reviewText: 'A short review helps us improve the route.',
    reviewButton: 'Leave a review',
    accessText: 'Your personal tour link remains active until its stated expiry time.',
    accessButton: 'Listen again',
    support: 'Something not working properly? Reply to this email and we will help personally.',
    reminderSubject: (title: string) => `How did you like ${title}?`,
    reminderPreview: 'A short review helps us and other visitors.',
    reminderTitle: 'May we ask one quick question?',
    reminderText:
      'How did you experience the audio tour? A review takes less than a minute. If you already responded, there is nothing else to do.',
  },
  de: {
    completedSubject: (title: string) => `Danke für deine Tour: ${title}`,
    completedPreview: 'Deine Tour ist beendet. Höre noch einmal zu oder teile deine Erfahrung.',
    completedTitle: 'Danke, dass du mit uns unterwegs warst',
    completedText:
      'Du hast die Audiotour beendet. Wir hoffen, dass du Hollum nun mit anderen Augen siehst.',
    reviewTitle: 'Wie war deine Erfahrung?',
    reviewText: 'Mit einer kurzen Bewertung hilfst du uns, die Route zu verbessern.',
    reviewButton: 'Bewertung abgeben',
    accessText: 'Dein persönlicher Tourlink bleibt bis zum angegebenen Ablaufzeitpunkt aktiv.',
    accessButton: 'Noch einmal anhören',
    support: 'Funktioniert etwas nicht? Antworte auf diese E-Mail. Wir helfen dir persönlich.',
    reminderSubject: (title: string) => `Wie hat dir ${title} gefallen?`,
    reminderPreview: 'Eine kurze Bewertung hilft uns und anderen Besuchern.',
    reminderTitle: 'Dürfen wir dir eine kurze Frage stellen?',
    reminderText:
      'Wie hast du die Audiotour erlebt? Eine Bewertung dauert weniger als eine Minute. Wenn du bereits geantwortet hast, brauchst du nichts mehr zu tun.',
  },
} as const

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function getClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY ontbreekt in deze omgeving.')
  return new Resend(apiKey)
}

function emailShell(preview: string, title: string, body: string) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(
    title
  )}</title></head>
<body style="margin:0;background:#f5efe3;color:#123c2f;font-family:Arial,sans-serif">
<div style="display:none;max-height:0;overflow:hidden">${escapeHtml(preview)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5efe3"><tr><td align="center" style="padding:28px 14px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 18px 50px rgba(18,60,47,.12)">
<tr><td style="background:#123c2f;padding:26px 28px;color:#ffffff"><div style="font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#a7f3d0">Ameland Audiotours</div><h1 style="margin:12px 0 0;font-size:30px;line-height:1.15">${escapeHtml(
    title
  )}</h1></td></tr>
<tr><td style="padding:28px">${body}</td></tr>
<tr><td style="padding:20px 28px;background:#eef6f1;color:#4b635b;font-size:13px;line-height:1.6">Bjorn &amp; Sander · Ameland Audiotours<br><a href="mailto:info@amelandaudiotours.nl" style="color:#123c2f">info@amelandaudiotours.nl</a></td></tr>
</table></td></tr></table></body></html>`
}

function button(label: string, href: string, primary = true) {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;margin-top:14px;padding:13px 20px;border-radius:999px;text-decoration:none;font-weight:700;${
    primary ? 'background:#123c2f;color:#ffffff' : 'background:#eef6f1;color:#123c2f'
  }">${escapeHtml(label)}</a>`
}

async function sendCustomerEmail(
  input: CustomerEmailInput,
  kind: 'completion' | 'review_reminder'
) {
  const t = copy[input.language]
  const isReminder = kind === 'review_reminder'
  const subject = isReminder
    ? t.reminderSubject(input.tourTitle)
    : t.completedSubject(input.tourTitle)
  const preview = isReminder ? t.reminderPreview : t.completedPreview
  const title = isReminder ? t.reminderTitle : t.completedTitle

  const body = isReminder
    ? `<p style="margin:0;font-size:17px;line-height:1.7;color:#31473d">${escapeHtml(
        t.reminderText
      )}</p>${button(t.reviewButton, input.reviewUrl)}`
    : `<p style="margin:0;font-size:17px;line-height:1.7;color:#31473d">${escapeHtml(
        t.completedText
      )}</p><div style="margin-top:22px;padding:20px;border-radius:18px;background:#f5efe3"><h2 style="margin:0;font-size:20px">${escapeHtml(
        t.reviewTitle
      )}</h2><p style="margin:8px 0 0;line-height:1.6;color:#4b635b">${escapeHtml(
        t.reviewText
      )}</p>${button(t.reviewButton, input.reviewUrl)}</div><div style="margin-top:18px;padding:20px;border-radius:18px;background:#eef6f1"><p style="margin:0;line-height:1.6;color:#4b635b">${escapeHtml(
        t.accessText
      )}</p>${button(t.accessButton, input.accessUrl, false)}</div><p style="margin:22px 0 0;font-size:14px;line-height:1.6;color:#64746e">${escapeHtml(
        t.support
      )}</p>`

  const from =
    process.env.MAIL_FROM || `${amelandBrand.fromName} <${amelandBrand.fromEmail}>`
  const replyTo = process.env.MAIL_REPLY_TO || amelandBrand.fromEmail

  const result = await getClient().emails.send({
    from,
    to: [input.to],
    replyTo,
    subject,
    html: emailShell(preview, title, body),
    text: isReminder
      ? `${title}\n\n${t.reminderText}\n\n${t.reviewButton}: ${input.reviewUrl}`
      : `${title}\n\n${t.completedText}\n\n${t.reviewButton}: ${input.reviewUrl}\n\n${t.accessButton}: ${input.accessUrl}\n\n${t.support}`,
    scheduledAt: input.scheduledAt,
    headers: {
      'X-Entity-Ref-ID': `${kind}-${input.orderId}`,
    },
  })

  if (result.error) {
    throw new Error(
      typeof result.error === 'object' ? JSON.stringify(result.error) : String(result.error)
    )
  }

  return result.data?.id ?? null
}

export function sendCompletionAftersalesEmail(input: CustomerEmailInput) {
  return sendCustomerEmail(input, 'completion')
}

export function scheduleReviewReminderEmail(input: CustomerEmailInput) {
  return sendCustomerEmail(input, 'review_reminder')
}

export async function sendLowRatingAlertEmail(input: LowRatingAlertInput) {
  const recipient = process.env.SUPPORT_EMAIL || amelandBrand.fromEmail
  const from =
    process.env.MAIL_FROM || `${amelandBrand.fromName} <${amelandBrand.fromEmail}>`
  const feedback = input.feedback?.trim() || 'Geen toelichting gegeven.'

  const result = await getClient().emails.send({
    from,
    to: [recipient],
    replyTo: recipient,
    subject: `Aandacht gevraagd: beoordeling ${input.rating}/5`,
    html: emailShell(
      `Nieuwe beoordeling van ${input.rating} uit 5`,
      'Een gast had een minder goede ervaring',
      `<p style="margin:0;line-height:1.7">Tour: <strong>${escapeHtml(
        input.tourTitle
      )}</strong><br>Score: <strong>${input.rating}/5</strong></p><div style="margin-top:18px;padding:18px;border-radius:16px;background:#f5efe3;line-height:1.7">${escapeHtml(
        feedback
      )}</div><p style="margin:18px 0 0;color:#64746e">Bestelling: ${escapeHtml(
        input.orderId
      )}</p>`
    ),
    text: `Tour: ${input.tourTitle}\nScore: ${input.rating}/5\nFeedback: ${feedback}\nBestelling: ${input.orderId}`,
    headers: {
      'X-Entity-Ref-ID': `low-rating-${input.orderId}`,
    },
  })

  if (result.error) {
    throw new Error(
      typeof result.error === 'object' ? JSON.stringify(result.error) : String(result.error)
    )
  }

  return result.data?.id ?? null
}
