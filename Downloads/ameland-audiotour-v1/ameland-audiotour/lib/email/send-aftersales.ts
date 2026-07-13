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

type ResendResult = {
  data?: { id?: string | null } | null
  error?: unknown
}

const copy = {
  nl: {
    completedSubject: (title: string) => `Bedankt voor je wandeling: ${title}`,
    completedPreview: 'Je tour is afgerond. Luister terug of deel je ervaring.',
    completedTitle: 'Bedankt dat je met ons op pad ging',
    completedText: 'Je hebt de audiotour afgerond. We hopen dat je Hollum nu met andere ogen bekijkt.',
    reviewTitle: 'Hoe was je ervaring?',
    reviewText: 'Met een korte beoordeling help je ons de route beter te maken.',
    reviewButton: 'Geef je beoordeling',
    accessText: 'Je persoonlijke tourlink blijft actief tot de aangegeven vervaldatum.',
    accessButton: 'Luister nog eens terug',
    support: 'Werkt iets niet goed? Antwoord op deze e-mail. We helpen je persoonlijk.',
    reminderSubject: (title: string) => `Hoe vond je ${title}?`,
    reminderPreview: 'Een korte beoordeling helpt ons en andere bezoekers.',
    reminderTitle: 'Mogen we je één vraag stellen?',
    reminderText: 'Hoe heb je de audiotour ervaren? Een beoordeling duurt minder dan een minuut. Heb je al gereageerd, dan hoef je niets meer te doen.',
  },
  en: {
    completedSubject: (title: string) => `Thank you for walking with us: ${title}`,
    completedPreview: 'Your tour is complete. Listen again or share your experience.',
    completedTitle: 'Thank you for exploring with us',
    completedText: 'You have completed the audio tour. We hope you now see Hollum through different eyes.',
    reviewTitle: 'How was your experience?',
    reviewText: 'A short review helps us improve the route.',
    reviewButton: 'Leave a review',
    accessText: 'Your personal tour link remains active until its stated expiry time.',
    accessButton: 'Listen again',
    support: 'Something not working properly? Reply to this email and we will help personally.',
    reminderSubject: (title: string) => `How did you like ${title}?`,
    reminderPreview: 'A short review helps us and other visitors.',
    reminderTitle: 'May we ask one quick question?',
    reminderText: 'How did you experience the audio tour? A review takes less than a minute. If you already responded, there is nothing else to do.',
  },
  de: {
    completedSubject: (title: string) => `Danke für deine Tour: ${title}`,
    completedPreview: 'Deine Tour ist beendet. Höre noch einmal zu oder teile deine Erfahrung.',
    completedTitle: 'Danke, dass du mit uns unterwegs warst',
    completedText: 'Du hast die Audiotour beendet. Wir hoffen, dass du Hollum nun mit anderen Augen siehst.',
    reviewTitle: 'Wie war deine Erfahrung?',
    reviewText: 'Mit einer kurzen Bewertung hilfst du uns, die Route zu verbessern.',
    reviewButton: 'Bewertung abgeben',
    accessText: 'Dein persönlicher Tourlink bleibt bis zum angegebenen Ablaufzeitpunkt aktiv.',
    accessButton: 'Noch einmal anhören',
    support: 'Funktioniert etwas nicht? Antworte auf diese E-Mail. Wir helfen dir persönlich.',
    reminderSubject: (title: string) => `Wie hat dir ${title} gefallen?`,
    reminderPreview: 'Eine kurze Bewertung hilft uns und anderen Besuchern.',
    reminderTitle: 'Dürfen wir dir eine kurze Frage stellen?',
    reminderText: 'Wie hast du die Audiotour erlebt? Eine Bewertung dauert weniger als eine Minute. Wenn du bereits geantwortet hast, brauchst du nichts mehr zu tun.',
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

function normalizeResult(result: unknown) {
  const response = result as ResendResult
  if (response.error) {
    const message =
      typeof response.error === 'object'
        ? JSON.stringify(response.error)
        : String(response.error)
    throw new Error(message)
  }
  return response.data?.id ?? null
}

function emailShell(preview: string, title: string, body: string) {
  const c = amelandBrand.colors
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${c.softGreen};color:${c.ink};font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preview)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${c.softGreen};padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:${c.white};border-radius:18px;overflow:hidden;box-shadow:0 18px 50px rgba(0,59,77,.14);">
          <tr>
            <td style="background:${c.white};padding:22px 28px;border-bottom:1px solid #e8e2d9;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="width:70px;vertical-align:middle;"><img src="${escapeHtml(amelandBrand.logoUrl)}" width="60" height="60" alt="Ameland Audiotours" style="display:block;width:60px;height:60px;border-radius:999px;border:1px solid #d9e0df;"></td>
                  <td style="vertical-align:middle;padding-left:14px;color:${c.deepGreen};"><div style="font-family:Georgia,Times New Roman,serif;font-size:24px;line-height:1;letter-spacing:.08em;">AMELAND</div><div style="margin-top:7px;font-size:11px;line-height:1;letter-spacing:.24em;">AUDIOTOURS</div></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr><td style="padding:0;background:${c.deepGreen};"><img src="${escapeHtml(amelandBrand.heroImageUrl)}" width="640" alt="Vuurtoren en duinen op Ameland" style="display:block;width:100%;max-width:640px;height:auto;border:0;"></td></tr>
          <tr>
            <td style="background:${c.deepGreen};padding:25px 28px 29px;color:${c.white};">
              <div style="font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#f58a78;">Ameland Audiotours</div>
              <h1 style="margin:10px 0 0;font-family:Georgia,Times New Roman,serif;font-size:31px;line-height:1.16;font-weight:400;color:${c.white};">${escapeHtml(title)}</h1>
              <div style="width:46px;height:3px;margin-top:15px;background:${c.warmSand};"></div>
            </td>
          </tr>
          <tr><td style="padding:30px 28px;background:${c.white};">${body}</td></tr>
          <tr>
            <td style="padding:22px 28px;background:${c.sand};color:${c.muted};font-size:13px;line-height:1.7;">
              <div style="font-family:Georgia,Times New Roman,serif;font-size:18px;color:${c.deepGreen};margin-bottom:7px;">Ameland Audiotours</div>
              Bjorn &amp; Sander · Verhalen die blijven hangen.<br>
              <a href="mailto:${escapeHtml(amelandBrand.fromEmail)}" style="color:${c.deepGreen};">${escapeHtml(amelandBrand.fromEmail)}</a>
            </td>
          </tr>
          <tr><td style="height:12px;background:${c.deepGreen};font-size:0;line-height:0;">&nbsp;</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
function button(label: string, href: string, primary = true) {
  const colors = primary
    ? 'background:#e96551;color:#ffffff'
    : 'background:#003b4d;color:#ffffff'
  return `<a href="${escapeHtml(href)}" style="display:inline-block;margin-top:14px;padding:14px 22px;border-radius:6px;text-decoration:none;font-weight:700;${colors}">${escapeHtml(
    label
  )}</a>`
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
    ? `<p style="margin:0;font-size:17px;line-height:1.7;color:#40534a">${escapeHtml(
        t.reminderText
      )}</p>${button(t.reviewButton, input.reviewUrl)}`
    : `<p style="margin:0;font-size:17px;line-height:1.7;color:#31473d">${escapeHtml(
        t.completedText
      )}</p><div style="margin-top:22px;padding:20px;border-radius:18px;background:#f1eadf"><h2 style="margin:0;font-family:Georgia,Times New Roman,serif;font-size:22px;font-weight:400;color:#003b4d">${escapeHtml(
        t.reviewTitle
      )}</h2><p style="margin:8px 0 0;line-height:1.6;color:#667067">${escapeHtml(
        t.reviewText
      )}</p>${button(t.reviewButton, input.reviewUrl)}</div><div style="margin-top:18px;padding:20px;border-radius:18px;background:#f7f5f1"><p style="margin:0;line-height:1.6;color:#667067">${escapeHtml(
        t.accessText
      )}</p>${button(t.accessButton, input.accessUrl, false)}</div><p style="margin:22px 0 0;font-size:14px;line-height:1.6;color:#667067">${escapeHtml(
        t.support
      )}</p>`

  const result = await getClient().emails.send({
    from: process.env.MAIL_FROM || `${amelandBrand.fromName} <${amelandBrand.fromEmail}>`,
    to: [input.to],
    replyTo: process.env.MAIL_REPLY_TO || amelandBrand.fromEmail,
    subject,
    html: emailShell(preview, title, body),
    text: isReminder
      ? `${title}\n\n${t.reminderText}\n\n${t.reviewButton}: ${input.reviewUrl}`
      : `${title}\n\n${t.completedText}\n\n${t.reviewButton}: ${input.reviewUrl}\n\n${t.accessButton}: ${input.accessUrl}\n\n${t.support}`,
    scheduledAt: input.scheduledAt,
    headers: { 'X-Entity-Ref-ID': `${kind}-${input.orderId}` },
  })

  return normalizeResult(result)
}

export function sendCompletionAftersalesEmail(input: CustomerEmailInput) {
  return sendCustomerEmail(input, 'completion')
}

export function scheduleReviewReminderEmail(input: CustomerEmailInput) {
  return sendCustomerEmail(input, 'review_reminder')
}

export async function sendLowRatingAlertEmail(input: LowRatingAlertInput) {
  const recipient = process.env.SUPPORT_EMAIL || amelandBrand.fromEmail
  const feedback = input.feedback?.trim() || 'Geen toelichting gegeven.'
  const result = await getClient().emails.send({
    from: process.env.MAIL_FROM || `${amelandBrand.fromName} <${amelandBrand.fromEmail}>`,
    to: [recipient],
    replyTo: recipient,
    subject: `Aandacht gevraagd: beoordeling ${input.rating}/5`,
    html: emailShell(
      `Nieuwe beoordeling van ${input.rating} uit 5`,
      'Een gast had een minder goede ervaring',
      `<p style="margin:0;line-height:1.7">Tour: <strong>${escapeHtml(
        input.tourTitle
      )}</strong><br>Score: <strong>${input.rating}/5</strong></p><div style="margin-top:18px;padding:18px;border-radius:16px;background:#f1eadf;line-height:1.7">${escapeHtml(
        feedback
      )}</div><p style="margin:18px 0 0;color:#667067">Bestelling: ${escapeHtml(
        input.orderId
      )}</p>`
    ),
    text: `Tour: ${input.tourTitle}\nScore: ${input.rating}/5\nFeedback: ${feedback}\nBestelling: ${input.orderId}`,
    headers: { 'X-Entity-Ref-ID': `low-rating-${input.orderId}` },
  })

  return normalizeResult(result)
}
