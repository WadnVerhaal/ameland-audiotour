import Link from 'next/link'
import { ShieldAlert, RefreshCw, ArrowRight, CheckCircle2 } from 'lucide-react'

type Language = 'nl' | 'en' | 'de'

type Props = {
  language: Language
  variant?: 'full' | 'compact'
}

export function ExpiredAccessCard({ language, variant = 'full' }: Props) {
  const content = {
    nl: {
      badge: 'Toegang verlopen',
      title: 'Deze tourlink is verlopen',
      text:
        'Je toegang was 48 uur geldig na aankoop. Die periode is voorbij, waardoor deze link niet meer bruikbaar is.',
      subtext:
        'Geen zorgen — je kunt de tour opnieuw aanschaffen en direct weer verder op pad.',
      primary: 'Bekijk tours',
      secondary: 'Terug naar homepage',
      point1: '48 uur toegang vanaf aankoop',
      point2: 'Na afloop vervalt de persoonlijke link automatisch',
      point3: 'Na een nieuwe aankoop ontvang je direct weer een geldige link',
      compactTitle: 'Deze tour is niet meer beschikbaar via deze link',
      compactText:
        'Je persoonlijke toegang was 48 uur geldig na aankoop. Die periode is nu verstreken.',
      compactSubtext:
        'Je kunt de tour opnieuw aanschaffen om direct weer toegang te krijgen.',
      compactPrimary: 'Nieuwe tour kopen',
    },
    en: {
      badge: 'Access expired',
      title: 'This tour link has expired',
      text:
        'Your access was valid for 48 hours after purchase. That period has ended, so this link can no longer be used.',
      subtext:
        'No worries — you can purchase the tour again and continue right away.',
      primary: 'View tours',
      secondary: 'Back to homepage',
      point1: '48 hours of access after purchase',
      point2: 'Your personal link expires automatically afterwards',
      point3: 'A new purchase gives you a new working link immediately',
      compactTitle: 'This tour is no longer available through this link',
      compactText:
        'Your personal access was valid for 48 hours after purchase. That period has now ended.',
      compactSubtext:
        'You can purchase the tour again to get access immediately.',
      compactPrimary: 'Buy a new tour',
    },
    de: {
      badge: 'Zugang abgelaufen',
      title: 'Dieser Tour-Link ist abgelaufen',
      text:
        'Dein Zugang war nach dem Kauf 48 Stunden gültig. Dieser Zeitraum ist vorbei, daher kann dieser Link nicht mehr verwendet werden.',
      subtext:
        'Kein Problem — du kannst die Tour erneut kaufen und direkt weitermachen.',
      primary: 'Touren ansehen',
      secondary: 'Zur Startseite',
      point1: '48 Stunden Zugang ab Kauf',
      point2: 'Danach läuft dein persönlicher Link automatisch ab',
      point3: 'Nach einem neuen Kauf erhältst du sofort wieder einen gültigen Link',
      compactTitle: 'Diese Tour ist über diesen Link nicht mehr verfügbar',
      compactText:
        'Dein persönlicher Zugang war nach dem Kauf 48 Stunden gültig. Dieser Zeitraum ist jetzt abgelaufen.',
      compactSubtext:
        'Du kannst die Tour erneut kaufen, um sofort wieder Zugang zu erhalten.',
      compactPrimary: 'Neue Tour kaufen',
    },
  } as const

  const t = content[language]

  const title = variant === 'compact' ? t.compactTitle : t.title
  const text = variant === 'compact' ? t.compactText : t.text
  const subtext = variant === 'compact' ? t.compactSubtext : t.subtext
  const primary = variant === 'compact' ? t.compactPrimary : t.primary

  return (
    <main className="mx-auto max-w-md px-4 py-5">
      <section className="overflow-hidden rounded-[2rem] border border-app bg-app-card shadow-soft">
        <div className="relative overflow-hidden px-6 pb-8 pt-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(38,68,62,0.10),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(191,161,74,0.12),transparent_40%)]" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f4ead6] px-3 py-1 text-xs font-semibold text-[#7a5f1e]">
              <ShieldAlert className="h-4 w-4" />
              {t.badge}
            </div>

            <div className="mt-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff7eb] text-[#a06a00] shadow-card">
              <RefreshCw className="h-8 w-8" />
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight text-app-accent">
              {title}
            </h1>

            <p className="mt-4 text-sm leading-7 text-app-muted">
              {text}
            </p>

            <p className="mt-3 text-sm leading-7 text-app-muted">
              {subtext}
            </p>

            {variant === 'full' ? (
              <div className="mt-6 rounded-[1.5rem] bg-white p-5 shadow-card">
                <div className="space-y-4 text-sm text-app-muted">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
                    <span>{t.point1}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
                    <span>{t.point2}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
                    <span>{t.point3}</span>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-6 space-y-3">
              <Link
                href="/tours"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-app-accent px-4 py-4 text-sm font-semibold text-white shadow-card transition hover:opacity-95"
              >
                {primary}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              <Link
                href="/"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-app bg-white px-4 py-4 text-sm font-semibold text-app-accent shadow-card transition hover:bg-app-soft"
              >
                {t.secondary}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}