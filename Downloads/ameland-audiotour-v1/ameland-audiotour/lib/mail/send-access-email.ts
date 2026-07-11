import { Resend } from 'resend'
import type { AppLanguage } from '@/lib/app-language'

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('Missing RESEND_API_KEY')
  return new Resend(apiKey)
}

const accessCopy = {
  nl: {
    subject: (title: string) => `Je tour staat klaar: ${title}`,
    heading: 'Je tour staat klaar',
    intro: 'Hier is je persoonlijke startlink voor',
    button: 'Open mijn tour',
    steps: ['Open de link op je telefoon', 'Sta locatie toe', 'Ga naar het startpunt en druk op start'],
  },
  en: {
    subject: (title: string) => `Your tour is ready: ${title}`,
    heading: 'Your tour is ready',
    intro: 'Here is your personal start link for',
    button: 'Open my tour',
    steps: ['Open the link on your phone', 'Allow location access', 'Go to the starting point and press start'],
  },
  de: {
    subject: (title: string) => `Deine Tour ist bereit: ${title}`,
    heading: 'Deine Tour ist bereit',
    intro: 'Hier ist dein persönlicher Startlink für',
    button: 'Meine Tour öffnen',
    steps: ['Öffne den Link auf deinem Handy', 'Erlaube den Standortzugriff', 'Gehe zum Startpunkt und drücke auf Start'],
  },
} as const

export async function sendAccessEmail(input: {
  to: string
  tourTitle: string
  accessUrl: string
  language?: AppLanguage
}) {
  const from = process.env.MAIL_FROM
  if (!from) throw new Error('Missing MAIL_FROM')

  const language = input.language || 'nl'
  const copy = accessCopy[language]
  const title = escapeHtml(input.tourTitle)
  const accessUrl = escapeHtml(input.accessUrl)

  return getResend().emails.send({
    from,
    to: input.to,
    subject: copy.subject(input.tourTitle),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#163c43;max-width:560px;margin:auto">
        <p style="font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#4f8a8e">De Jutter · Ameland Audiotours</p>
        <h2>${copy.heading}</h2>
        <p>${copy.intro} <strong>${title}</strong>.</p>
        <p><a href="${accessUrl}" style="display:inline-block;padding:13px 20px;background:#0f4b58;color:#fff;text-decoration:none;border-radius:14px;font-weight:700">${copy.button}</a></p>
        <ol>${copy.steps.map((step) => `<li>${step}</li>`).join('')}</ol>
      </div>
    `,
  })
}

export async function sendSupportNotification(input: {
  reference: string
  category: string
  summary: string
  email: string | null
  orderId: string | null
  pageContext: string
}) {
  const from = process.env.MAIL_FROM
  if (!from) throw new Error('Missing MAIL_FROM')
  const to = process.env.SUPPORT_EMAIL || 'info@amelandaudiotours.nl'

  return getResend().emails.send({
    from,
    to,
    subject: `De Jutter: nieuw supportverzoek ${input.reference.slice(0, 8).toUpperCase()}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#163c43">
        <h2>Nieuw supportverzoek van De Jutter</h2>
        <p><strong>Categorie:</strong> ${escapeHtml(input.category)}</p>
        <p><strong>Samenvatting:</strong><br>${escapeHtml(input.summary)}</p>
        <p><strong>E-mail:</strong> ${escapeHtml(input.email || 'Niet opgegeven')}</p>
        <p><strong>Bestelnummer:</strong> ${escapeHtml(input.orderId || 'Niet opgegeven')}</p>
        <p><strong>Pagina:</strong> ${escapeHtml(input.pageContext)}</p>
      </div>
    `,
  })
}
