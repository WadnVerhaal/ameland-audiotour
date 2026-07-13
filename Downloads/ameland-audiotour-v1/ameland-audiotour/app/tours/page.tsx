import Link from 'next/link'
import {
  ArrowRight,
  Check,
  Clock3,
  Footprints,
  Headphones,
  MapPinned,
  Route,
  ShieldCheck,
} from 'lucide-react'
import { asNumber, asText, getAvailableTours, getTourSlug } from '@/lib/tour-catalog'

export const dynamic = 'force-dynamic'

type Lang = 'nl' | 'de' | 'en'

function getLang(searchParams?: { lang?: string }): Lang {
  return searchParams?.lang === 'de' || searchParams?.lang === 'en' ? searchParams.lang : 'nl'
}

function localized(tour: Record<string, any>, base: string, language: Lang, fallback = '') {
  const values =
    language === 'en'
      ? [tour[`${base}_en`], tour[base], tour[`${base}_de`]]
      : language === 'de'
      ? [tour[`${base}_de`], tour[base], tour[`${base}_en`]]
      : [tour[base], tour[`${base}_en`], tour[`${base}_de`]]
  return values.find((value) => typeof value === 'string' && value.trim())?.trim() || fallback
}

function durationLabel(tour: Record<string, any>) {
  const minutes = asNumber(tour.duration_minutes)
  return minutes ? `${minutes} min` : asText(tour.duration, '90 min')
}

function distanceLabel(tour: Record<string, any>, lang: Lang) {
  const km = asNumber(tour.distance_km)
  if (!km) return lang === 'en' ? '6.5 km' : '6,5 km'
  const value = String(km)
  return `${lang === 'en' ? value : value.replace('.', ',')} km`
}

function priceLabel(tour: Record<string, any>, lang: Lang) {
  const cents = asNumber(tour.price_cents) || 0
  const locale = lang === 'de' ? 'de-DE' : lang === 'en' ? 'en-GB' : 'nl-NL'
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(cents / 100)
}

const COPY = {
  nl: {
    eyebrow: 'Audiotours op Ameland',
    title: 'Kies je wandeling',
    intro: 'Bekijk rustig wat je krijgt. Na betaling open je de tour en druk je zelf op Start de wandeling.',
    journey: [['1', 'Kies'], ['2', 'Betaal veilig'], ['3', 'Start de wandeling']],
    available: 'Nu te beleven',
    facts: ['Duur', 'Afstand', 'Stops'],
    featuresTitle: 'Tijdens de wandeling',
    features: ['De kaart leidt je steeds naar één volgende stop', 'Het verhaal komt beschikbaar wanneer je aankomt', 'Je loopt en luistert volledig in je eigen tempo'],
    price: 'Prijs per tour',
    order: 'Bekijk en bestel',
    secure: 'Veilig betalen via Mollie · 48 uur toegang',
    upcoming: 'Hierna op Ameland',
    upcomingText: 'Nieuwe wandelingen voor Nes, Ballum en Buren zijn in voorbereiding.',
    future: [['Nes', 'Dorpshart en historie'], ['Ballum', 'Cammingha en bestuur'], ['Buren', 'Boerenleven en duinen']],
  },
  en: {
    eyebrow: 'Audio tours on Ameland',
    title: 'Choose your walk',
    intro: 'See exactly what is included. After payment, open the tour and press Start the walk yourself.',
    journey: [['1', 'Choose'], ['2', 'Pay securely'], ['3', 'Start the walk']],
    available: 'Available now',
    facts: ['Duration', 'Distance', 'Stops'],
    featuresTitle: 'During the walk',
    features: ['The map guides you to one next stop at a time', 'The story becomes available when you arrive', 'Walk and listen entirely at your own pace'],
    price: 'Price per tour',
    order: 'View and book',
    secure: 'Secure payment with Mollie · 48-hour access',
    upcoming: 'Next on Ameland',
    upcomingText: 'New walks for Nes, Ballum and Buren are in development.',
    future: [['Nes', 'Village centre and history'], ['Ballum', 'Cammingha and government'], ['Buren', 'Farm life and dunes']],
  },
  de: {
    eyebrow: 'Audiotouren auf Ameland',
    title: 'Wähle deinen Spaziergang',
    intro: 'Sieh in Ruhe, was enthalten ist. Nach der Zahlung öffnest du die Tour und drückst selbst auf Wanderung starten.',
    journey: [['1', 'Wählen'], ['2', 'Sicher bezahlen'], ['3', 'Wanderung starten']],
    available: 'Jetzt erlebbar',
    facts: ['Dauer', 'Entfernung', 'Stopps'],
    featuresTitle: 'Während der Wanderung',
    features: ['Die Karte führt dich jeweils zu einem nächsten Stopp', 'Die Geschichte wird bei deiner Ankunft verfügbar', 'Du gehst und hörst vollständig in deinem eigenen Tempo'],
    price: 'Preis pro Tour',
    order: 'Ansehen und buchen',
    secure: 'Sichere Zahlung mit Mollie · 48 Stunden Zugang',
    upcoming: 'Als Nächstes auf Ameland',
    upcomingText: 'Neue Wanderungen für Nes, Ballum und Buren sind in Vorbereitung.',
    future: [['Nes', 'Dorfzentrum und Geschichte'], ['Ballum', 'Cammingha und Verwaltung'], ['Buren', 'Bauernleben und Dünen']],
  },
} as const

export default async function ToursPage({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const lang = getLang(resolvedSearchParams)
  const t = COPY[lang]
  const tours = await getAvailableTours()

  return (
    <main className="min-h-[100svh] bg-[#f1eadf] pb-16 text-[#20372f]">
      <section className="px-4 pb-8 pt-10 sm:px-8 sm:pb-12 sm:pt-14">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-black uppercase tracking-[.22em] text-[#d85c49]">{t.eyebrow}</p>
          <h1 className="mt-3 max-w-4xl font-serif text-[clamp(3rem,8vw,5.7rem)] font-medium leading-[.92] tracking-[-.035em] text-[#082f3e]">{t.title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#667067] sm:text-lg sm:leading-8">{t.intro}</p>

          <div className="mt-7 grid grid-cols-3 gap-2 sm:max-w-2xl sm:gap-3">
            {t.journey.map(([number, label]) => (
              <div key={number} className="rounded-2xl border border-[#d8cfc1] bg-[#fffdf8] p-3 sm:p-4">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#003b4d] text-xs font-black text-white">{number}</span>
                <p className="mt-3 text-xs font-black leading-4 text-[#31473d] sm:text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-8">
        <section className="space-y-4">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#7a8875]">{t.available}</p>

          {tours.map((tour: Record<string, any>, index: number) => {
            const slug = getTourSlug(tour)
            const title = localized(tour, 'title', lang, index === 0 ? 'Maak kennis met Hollum' : 'Audiotour Ameland')
            const description = localized(tour, 'description', lang, '')
            const storedImage = asText(tour.hero_image_url)
            const image = storedImage.startsWith('https://www.amelandaudiotours.nl/images/')
              ? storedImage.replace('https://www.amelandaudiotours.nl', '')
              : storedImage || '/images/tour-dorp.jpg'
            const price = priceLabel(tour, lang)
            const factValues = [durationLabel(tour), distanceLabel(tour, lang), '9']

            return (
              <article key={slug} className="overflow-hidden rounded-[2rem] border border-[#ddd2c2] bg-[#fffdf8] shadow-[0_22px_65px_rgba(38,48,40,.11)]">
                <div className="grid lg:grid-cols-[1.08fr_.92fr]">
                  <div className="relative min-h-[300px] overflow-hidden bg-slate-900 sm:min-h-[390px] lg:min-h-[520px]">
                    {image ? <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover" /> : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8">
                      <h2 className="max-w-2xl font-serif text-4xl font-medium leading-[.95] tracking-[-.025em] text-[#082f3e] sm:text-5xl">{title}</h2>
                      {description ? <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base sm:leading-7">{description}</p> : null}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between p-5 sm:p-8">
                    <div>
                      <div className="grid grid-cols-3 gap-2">
                        {factValues.map((value, factIndex) => {
                          const Icon = [Clock3, Route, MapPinned][factIndex]
                          return (
                            <div key={t.facts[factIndex]} className="rounded-2xl bg-[#e8efe7] p-3 text-[#315848]">
                              <Icon className="h-5 w-5" />
                              <p className="mt-3 text-[10px] font-black uppercase tracking-[.13em] text-[#718078]">{t.facts[factIndex]}</p>
                              <p className="mt-1 text-base font-black sm:text-lg">{value}</p>
                            </div>
                          )
                        })}
                      </div>

                      <p className="mt-7 text-xs font-black uppercase tracking-[.18em] text-[#7a8875]">{t.featuresTitle}</p>
                      <div className="mt-4 space-y-4">
                        {t.features.map((feature, featureIndex) => {
                          const Icon = [MapPinned, Headphones, Footprints][featureIndex]
                          return (
                            <p key={feature} className="flex items-start gap-3 text-sm font-bold leading-6 text-[#40534a]">
                              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#dcebe1] text-[#0f5d67]"><Icon className="h-4 w-4" /></span>
                              {feature}
                            </p>
                          )
                        })}
                      </div>
                    </div>

                    <div className="mt-9 border-t border-[#e8dfd2] pt-6">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[.16em] text-[#7a8875]">{t.price}</p>
                          <p className="mt-1 text-4xl font-black tracking-[-.04em]">{price}</p>
                        </div>
                        <ShieldCheck className="h-8 w-8 text-[#0f5d67]" />
                      </div>
                      <Link href={`/checkout/${slug}?lang=${lang}`} className="mt-5 inline-flex min-h-16 w-full items-center justify-center gap-3 rounded-md bg-[#e96551] px-6 text-base font-black text-white shadow-[0_16px_38px_rgba(233,101,81,.24)] transition hover:-translate-y-0.5 hover:bg-[#f17460]">
                        {t.order} <ArrowRight className="h-5 w-5" />
                      </Link>
                      <p className="mt-3 text-center text-xs font-bold leading-5 text-[#738078]">{t.secure}</p>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </section>

        <section className="rounded-xl bg-[#003b4d] p-6 text-white sm:p-9">
          <p className="text-xs font-black uppercase tracking-[.2em] text-emerald-200">{t.upcoming}</p>
          <h2 className="mt-3 max-w-3xl font-serif text-3xl font-medium tracking-[-.02em] sm:text-4xl">{t.upcomingText}</h2>
          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            {t.future.map(([place, description]) => (
              <article key={place} className="rounded-[1.3rem] border border-white/10 bg-white/[0.07] p-4">
                <p className="text-lg font-black">{place}</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">{description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
