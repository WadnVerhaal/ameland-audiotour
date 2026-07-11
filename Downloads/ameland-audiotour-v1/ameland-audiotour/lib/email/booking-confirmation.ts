import { amelandBrand } from '../brand'

export type EmailLanguage = 'nl' | 'en' | 'de'

export type BookingConfirmationInput = {
  to: string
  language?: string | null
  tourTitle?: string | null
  tourDescription?: string | null
  duration?: string | number | null
  distance?: string | number | null
  accessUrl?: string | null
  token?: string | null
  expiresAt?: string | Date | null
  orderId?: string | null
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export function normalizeLanguage(language?: string | null): EmailLanguage {
  const raw = String(language || 'nl').toLowerCase()

  if (raw.startsWith('en')) return 'en'
  if (raw.startsWith('de')) return 'de'

  return 'nl'
}

function formatExpiresAt(value: BookingConfirmationInput['expiresAt'], language: EmailLanguage): string | null {
  if (!value) return null

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) return null

  const locale = language === 'de' ? 'de-DE' : language === 'en' ? 'en-GB' : 'nl-NL'

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Amsterdam',
  }).format(date)
}

const copy = {
  nl: {
    subjectPrefix: 'Je audiotour staat klaar',
    preheader: 'Open je persoonlijke link en ontdek Ameland op je eigen tempo.',
    eyebrow: 'Boeking bevestigd',
    title: 'Je audiotour staat klaar',
    intro: 'Bedankt voor je boeking. Met de persoonlijke link hieronder open je de tour direct op je telefoon.',
    cta: 'Start je tour',
    detailsTitle: 'Jouw tour',
    duration: 'Duur',
    distance: 'Route',
    validUntil: 'Toegang geldig tot',
    howTitle: 'Zo werkt het',
    steps: [
      'Open de persoonlijke link op je telefoon.',
      'Geef locatie-toegang wanneer de app daarom vraagt.',
      'Volg de route en luister naar de verhalen op de juiste plekken.',
    ],
    safetyTitle: 'Veilig luisteren onderweg',
    safety:
      'Gebruik bij voorkeur één oordopje of open-ear audio. Houd altijd aandacht voor verkeer, fietsers, wandelaars en je omgeving. Je kunt audiofragmenten pauzeren en terugspoelen om ze later op een veilig moment opnieuw te luisteren.',
    footer:
      'Veel plezier op Ameland. We hopen dat je het eiland niet alleen ziet, maar ook echt voelt.',
    signoff: 'Hartelijke groet,',
    team: 'Bjorn & Sander',
    help: 'Vragen? Mail ons gerust via',
    fallback: 'Werkt de knop niet? Kopieer dan deze link:',
    order: 'Boeking',
    defaultTour: 'Ameland Audiotour',
    defaultDescription: 'Een audiotour vol authentieke eilandverhalen.',
  },
  en: {
    subjectPrefix: 'Your audio tour is ready',
    preheader: 'Open your personal link and discover Ameland at your own pace.',
    eyebrow: 'Booking confirmed',
    title: 'Your audio tour is ready',
    intro: 'Thank you for your booking. Use the personal link below to open the tour directly on your phone.',
    cta: 'Start your tour',
    detailsTitle: 'Your tour',
    duration: 'Duration',
    distance: 'Route',
    validUntil: 'Access valid until',
    howTitle: 'How it works',
    steps: [
      'Open the personal link on your phone.',
      'Allow location access when the app asks for it.',
      'Follow the route and listen to the stories at the right places.',
    ],
    safetyTitle: 'Listen safely on the move',
    safety:
      'Preferably use one earbud or open-ear audio. Always keep paying attention to traffic, cyclists, walkers and your surroundings. You can pause and rewind audio fragments to listen again later at a safe moment.',
    footer:
      'Enjoy Ameland. We hope you do not just see the island, but truly feel it.',
    signoff: 'Warm regards,',
    team: 'Bjorn & Sander',
    help: 'Questions? Feel free to email us at',
    fallback: 'Button not working? Copy this link:',
    order: 'Booking',
    defaultTour: 'Ameland Audio Tour',
    defaultDescription: 'An audio tour filled with authentic island stories.',
  },
  de: {
    subjectPrefix: 'Deine Audiotour ist bereit',
    preheader: 'Öffne deinen persönlichen Link und entdecke Ameland in deinem eigenen Tempo.',
    eyebrow: 'Buchung bestätigt',
    title: 'Deine Audiotour ist bereit',
    intro: 'Vielen Dank für deine Buchung. Über den persönlichen Link unten öffnest du die Tour direkt auf deinem Smartphone.',
    cta: 'Tour starten',
    detailsTitle: 'Deine Tour',
    duration: 'Dauer',
    distance: 'Route',
    validUntil: 'Zugang gültig bis',
    howTitle: 'So funktioniert es',
    steps: [
      'Öffne den persönlichen Link auf deinem Smartphone.',
      'Erlaube den Standortzugriff, wenn die App danach fragt.',
      'Folge der Route und höre die Geschichten an den passenden Orten.',
    ],
    safetyTitle: 'Sicher unterwegs hören',
    safety:
      'Nutze am besten nur einen Ohrhörer oder Open-Ear-Audio. Achte immer auf Verkehr, Radfahrer, Fußgänger und deine Umgebung. Du kannst Audiofragmente pausieren und zurückspulen, um sie später an einem sicheren Ort erneut anzuhören.',
    footer:
      'Viel Freude auf Ameland. Wir hoffen, dass du die Insel nicht nur siehst, sondern wirklich erlebst.',
    signoff: 'Herzliche Grüße,',
    team: 'Bjorn & Sander',
    help: 'Fragen? Schreib uns gern an',
    fallback: 'Funktioniert der Button nicht? Kopiere diesen Link:',
    order: 'Buchung',
    defaultTour: 'Ameland Audiotour',
    defaultDescription: 'Eine Audiotour voller authentischer Inselgeschichten.',
  },
} as const

export function buildBookingConfirmationEmail(input: BookingConfirmationInput) {
  const language = normalizeLanguage(input.language)
  const t = copy[language]
  const brand = amelandBrand
  const c = brand.colors

  const tourTitle = input.tourTitle || t.defaultTour
  const tourDescription = input.tourDescription || t.defaultDescription
  const duration = input.duration ? String(input.duration) : '90 min'
  const distance = input.distance ? String(input.distance) : '± 6,5 km'
  const expires = formatExpiresAt(input.expiresAt, language)
  const accessUrl = input.accessUrl || ''

  const subject = `${t.subjectPrefix} – ${tourTitle}`

  const detailRows = [
    [t.duration, duration],
    [t.distance, distance],
    ...(expires ? [[t.validUntil, expires]] : []),
    ...(input.orderId ? [[t.order, input.orderId]] : []),
  ]

  const stepsHtml = t.steps
    .map(
      (step, index) => `
        <div style="margin:0 0 12px 0;">
          <span style="display:inline-block;width:26px;height:26px;border-radius:999px;background:${c.deepGreen};color:${c.white};text-align:center;line-height:26px;font-size:13px;font-weight:800;margin-right:8px;">${index + 1}</span>
          <span style="font-size:15px;line-height:1.6;color:${c.ink};">${escapeHtml(step)}</span>
        </div>
      `
    )
    .join('')

  const detailRowsHtml = detailRows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 0;border-top:1px solid #efe5d5;color:${c.muted};font-size:14px;">${escapeHtml(label)}</td>
          <td align="right" style="padding:10px 0;border-top:1px solid #efe5d5;color:${c.ink};font-size:14px;font-weight:700;">${escapeHtml(value)}</td>
        </tr>
      `
    )
    .join('')

  const html = `<!doctype html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${c.softGreen};font-family:Arial,Helvetica,sans-serif;color:${c.ink};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${escapeHtml(t.preheader)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${c.softGreen};padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:${c.cream};border-radius:${brand.radius.large};overflow:hidden;box-shadow:0 18px 50px rgba(36,68,57,.16);">
          <tr>
            <td style="background:${c.deepGreen};padding:34px 30px 26px 30px;color:${c.white};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:${c.warmSand};font-weight:700;">
                      ${escapeHtml(t.eyebrow)}
                    </div>
                    <h1 style="margin:14px 0 10px 0;font-size:34px;line-height:1.08;color:${c.white};font-weight:800;">
                      ${escapeHtml(t.title)}
                    </h1>
                    <p style="margin:0;color:#e8f0e9;font-size:16px;line-height:1.6;max-width:520px;">
                      ${escapeHtml(tourTitle)}
                    </p>
                  </td>
                  <td align="right" style="width:108px;">
                    <div style="width:86px;height:86px;border-radius:999px;background:${c.sand};color:${c.deepGreen};text-align:center;line-height:86px;font-size:27px;font-weight:900;border:4px solid rgba(255,255,255,.35);">
                      AA
                    </div>
                  </td>
                </tr>
              </table>

              <div style="margin-top:24px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.18);border-radius:20px;padding:14px 16px;color:#f7f0df;font-size:14px;line-height:1.5;">
                Wad → Dorp → Duin → Verhaal
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:30px;">
              <p style="margin:0 0 22px 0;font-size:17px;line-height:1.7;color:${c.ink};">
                ${escapeHtml(t.intro)}
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;">
                <tr>
                  <td style="background:${c.green};border-radius:999px;">
                    <a href="${escapeHtml(accessUrl)}" style="display:inline-block;padding:16px 26px;color:${c.white};text-decoration:none;font-weight:800;font-size:16px;border-radius:999px;">
                      ${escapeHtml(t.cta)}
                    </a>
                  </td>
                </tr>
              </table>

              <div style="background:${c.white};border:1px solid #e8ddca;border-radius:${brand.radius.medium};padding:22px;margin-bottom:22px;">
                <div style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:${c.green};font-weight:800;margin-bottom:10px;">
                  ${escapeHtml(t.detailsTitle)}
                </div>
                <h2 style="margin:0 0 8px 0;font-size:24px;line-height:1.25;color:${c.deepGreen};">
                  ${escapeHtml(tourTitle)}
                </h2>
                <p style="margin:0 0 18px 0;color:${c.muted};font-size:15px;line-height:1.6;">
                  ${escapeHtml(tourDescription)}
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${detailRowsHtml}
                </table>
              </div>

              <div style="background:${c.sand};border-radius:${brand.radius.medium};padding:22px;margin-bottom:22px;">
                <h3 style="margin:0 0 14px 0;color:${c.deepGreen};font-size:20px;">${escapeHtml(t.howTitle)}</h3>
                ${stepsHtml}
              </div>

              <div style="background:#fff7df;border-left:5px solid ${c.warmSand};border-radius:${brand.radius.small};padding:18px 18px;margin-bottom:24px;">
                <h3 style="margin:0 0 8px 0;color:${c.deepGreen};font-size:18px;">${escapeHtml(t.safetyTitle)}</h3>
                <p style="margin:0;color:${c.ink};font-size:14px;line-height:1.65;">
                  ${escapeHtml(t.safety)}
                </p>
              </div>

              <p style="margin:0 0 8px 0;color:${c.muted};font-size:13px;line-height:1.6;">
                ${escapeHtml(t.fallback)}
              </p>
              <p style="margin:0 0 26px 0;word-break:break-all;">
                <a href="${escapeHtml(accessUrl)}" style="color:${c.green};font-size:13px;">${escapeHtml(accessUrl)}</a>
              </p>

              <p style="margin:0;color:${c.ink};font-size:16px;line-height:1.7;">
                ${escapeHtml(t.footer)}<br><br>
                ${escapeHtml(t.signoff)}<br>
                <strong>${escapeHtml(t.team)}</strong>
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:${c.deepGreen};padding:22px 30px;color:#dfe9e1;">
              <p style="margin:0 0 8px 0;font-size:14px;line-height:1.6;">
                ${escapeHtml(brand.name)} · Ameland
              </p>
              <p style="margin:0;font-size:13px;line-height:1.6;color:#bdd0c5;">
                ${escapeHtml(t.help)} <a href="mailto:${escapeHtml(brand.fromEmail)}" style="color:${c.sand};">${escapeHtml(brand.fromEmail)}</a>
              </p>
            </td>
          </tr>
        </table>

        <p style="max-width:680px;margin:16px auto 0 auto;color:#7b8a82;font-size:12px;line-height:1.6;text-align:center;">
          ${escapeHtml(brand.name)} · ${escapeHtml(brand.websiteUrl)}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`

  const text = [
    subject,
    '',
    t.intro,
    '',
    `${t.cta}: ${accessUrl}`,
    '',
    `${t.detailsTitle}: ${tourTitle}`,
    `${t.duration}: ${duration}`,
    `${t.distance}: ${distance}`,
    expires ? `${t.validUntil}: ${expires}` : '',
    input.orderId ? `${t.order}: ${input.orderId}` : '',
    '',
    t.howTitle,
    ...t.steps.map((step, index) => `${index + 1}. ${step}`),
    '',
    t.safetyTitle,
    t.safety,
    '',
    t.footer,
    '',
    t.signoff,
    t.team,
    '',
    `${t.help} ${brand.fromEmail}`,
  ]
    .filter(Boolean)
    .join('\n')

  return {
    subject,
    html,
    text,
    language,
  }
}
