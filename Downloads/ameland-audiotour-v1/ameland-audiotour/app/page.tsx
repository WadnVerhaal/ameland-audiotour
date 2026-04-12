import Link from 'next/link'
import {
  Headphones,
  Bike,
  Clock3,
  MapPinned,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { translations, isAppLanguage, type AppLanguage } from '@/lib/app-language'
import { getServerLanguage } from '@/lib/app-language-server'
import { LanguagePicker } from '@/components/language-picker'
import { LanguageParamSync } from '@/components/language-param-sync'

type Props = {
  searchParams: Promise<{
    lang?: string
  }>
}

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams
  const queryLang = params.lang
  const cookieLanguage = await getServerLanguage()

  const language: AppLanguage = isAppLanguage(queryLang) ? queryLang : cookieLanguage
  const t = translations[language]

  return (
    <main className="mx-auto max-w-md px-4 py-5">
      <LanguageParamSync lang={queryLang} />

      <section className="mb-4 rounded-[1.5rem] border border-app bg-app-card p-4 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
              {t.chooseLanguage}
            </p>
            <p className="mt-1 text-sm leading-5 text-app-muted">
              {t.chooseLanguageText}
            </p>
          </div>

          <div className="shrink-0">
            <LanguagePicker currentLanguage={language} />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[2rem] border border-app bg-app-card shadow-soft">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(233,223,191,0.7),transparent_35%)]" />
        <div className="relative p-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-app-soft px-3 py-1 text-xs font-semibold text-[#6a5c37]">
            <Sparkles className="h-3.5 w-3.5" />
            {t.appName}
          </div>

          <h1 className="mt-4 text-3xl font-bold leading-tight text-app-accent">
            {t.discoverTitle}
          </h1>

          <p className="mt-3 max-w-[30ch] text-sm leading-6 text-app-muted">
            {t.discoverText}
          </p>

          <div className="mt-6">
            <Link
              href="/tours"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-app-accent px-4 py-3.5 text-sm font-semibold text-white shadow-card transition hover:opacity-95"
            >
              {t.startTour}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white p-4 shadow-card">
              <MapPinned className="h-5 w-5 text-app-accent" />
              <p className="mt-2 text-sm font-semibold text-app-accent">{t.liveMap}</p>
              <p className="mt-1 text-xs leading-5 text-app-muted">
                {t.liveMapText}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-card">
              <Headphones className="h-5 w-5 text-app-accent" />
              <p className="mt-2 text-sm font-semibold text-app-accent">{t.audioOnTheGo}</p>
              <p className="mt-1 text-xs leading-5 text-app-muted">
                {t.audioOnTheGoText}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-card">
              <Clock3 className="h-5 w-5 text-app-accent" />
              <p className="mt-2 text-sm font-semibold text-app-accent">{t.startDirectly}</p>
              <p className="mt-1 text-xs leading-5 text-app-muted">
                {t.startDirectlyText}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-card">
              <Bike className="h-5 w-5 text-app-accent" />
              <p className="mt-2 text-sm font-semibold text-app-accent">{t.walkOrBike}</p>
              <p className="mt-1 text-xs leading-5 text-app-muted">
                {t.walkOrBikeText}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-[1.75rem] border border-app bg-app-card p-5 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
          {t.howItWorks}
        </p>

        <div className="mt-4 space-y-3 text-sm text-app-muted">
          <div className="rounded-2xl bg-white p-4">
            <span className="font-semibold text-app-accent">1.</span> {t.step1}
          </div>
          <div className="rounded-2xl bg-white p-4">
            <span className="font-semibold text-app-accent">2.</span> {t.step2}
          </div>
          <div className="rounded-2xl bg-white p-4">
            <span className="font-semibold text-app-accent">3.</span> {t.step3}
          </div>
        </div>
      </section>

      <div className="mt-5 text-center text-xs text-app-muted">
        <Link href="/privacy" className="underline">
          {t.privacy}
        </Link>
        <span className="mx-2">·</span>
        <Link href="/voorwaarden" className="underline">
          {t.terms}
        </Link>
      </div>
    </main>
  )
}