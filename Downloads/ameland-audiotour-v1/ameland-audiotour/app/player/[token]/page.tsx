import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import {
  TourPlayer,
  type PlayerLanguage,
  type PlayerStop,
  type PlayerTour,
} from '@/components/player/tour-player'
import { getTourByAccessToken } from '@/lib/data/access'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type PageProps = {
  params: Promise<{ token: string }>
  searchParams?: Promise<{ lang?: string | string[] }>
}

const copy = {
  nl: {
    invalidTitle: 'Deze tourlink werkt niet',
    invalidText: 'Controleer of je de volledige persoonlijke link uit je e-mail hebt geopend.',
    expiredTitle: 'Deze toegang is verlopen',
    expiredText: 'Je persoonlijke tourlink is niet meer actief. Bekijk de beschikbare tours of neem contact met ons op.',
    back: 'Terug naar tours',
    support: 'Hulp nodig? Mail ons',
  },
  en: {
    invalidTitle: 'This tour link does not work',
    invalidText: 'Check whether you opened the full personal link from your email.',
    expiredTitle: 'This access has expired',
    expiredText: 'Your personal tour link is no longer active. View the available tours or contact us.',
    back: 'Back to tours',
    support: 'Need help? Email us',
  },
  de: {
    invalidTitle: 'Dieser Tourlink funktioniert nicht',
    invalidText: 'Prüfe, ob du den vollständigen persönlichen Link aus deiner E-Mail geöffnet hast.',
    expiredTitle: 'Dieser Zugang ist abgelaufen',
    expiredText: 'Dein persönlicher Tourlink ist nicht mehr aktiv. Sieh dir die verfügbaren Touren an oder kontaktiere uns.',
    back: 'Zurück zu den Touren',
    support: 'Hilfe nötig? E-Mail senden',
  },
} as const

function normalizeLanguage(value: unknown): PlayerLanguage {
  const raw = Array.isArray(value) ? value[0] : value
  return raw === 'en' || raw === 'de' ? raw : 'nl'
}

function AccessMessage({
  language,
  type,
}: {
  language: PlayerLanguage
  type: 'invalid' | 'expired'
}) {
  const t = copy[language]
  const title = type === 'expired' ? t.expiredTitle : t.invalidTitle
  const text = type === 'expired' ? t.expiredText : t.invalidText

  return (
    <main className="min-h-[100dvh] bg-slate-950 px-5 py-8 text-white">
      <section className="mx-auto flex min-h-[82dvh] max-w-xl items-center justify-center">
        <div className="w-full rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 text-center shadow-2xl backdrop-blur">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-300 text-slate-950">
            <AlertCircle className="h-8 w-8" />
          </div>
          <p className="mt-5 text-xs font-black uppercase tracking-[.24em] text-emerald-300">Ameland Audiotours</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">{title}</h1>
          <p className="mt-4 text-base leading-7 text-slate-300">{text}</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link
              href={`/tours?lang=${language}`}
              className="rounded-2xl bg-white px-5 py-3 font-black text-slate-950 transition hover:bg-emerald-100"
            >
              {t.back}
            </Link>
            <a
              href="mailto:info@amelandaudiotours.nl"
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-black text-white transition hover:bg-white/20"
            >
              {t.support}
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}

export default async function PlayerPage({ params, searchParams }: PageProps) {
  const { token } = await params
  const query = searchParams ? await searchParams : {}
  const language = normalizeLanguage(query.lang)
  const data = await getTourByAccessToken(token)

  if (data.status === 'expired') {
    return <AccessMessage language={language} type="expired" />
  }

  if (data.status !== 'ok') {
    return <AccessMessage language={language} type="invalid" />
  }

  return (
    <TourPlayer
      token={token}
      tour={data.tour as PlayerTour}
      stops={data.stops as PlayerStop[]}
      initialLanguage={language}
      expiresAt={data.expiresAt}
    />
  )
}
