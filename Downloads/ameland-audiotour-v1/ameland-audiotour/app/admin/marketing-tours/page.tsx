import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/server'
import { updateMarketingTourAction } from './actions'

type MarketingTourRow = {
  slug: string
  image_url: string
  featured: boolean
  available: boolean
  sort_order: number
}

type MarketingTranslationRow = {
  locale: 'nl' | 'en' | 'de'
  title: string
  badge: string
  duration_label: string
  cta: string
  points: string[]
}

type MarketingTourWithTranslations = MarketingTourRow & {
  translations: Record<'nl' | 'en' | 'de', MarketingTranslationRow | null>
}

async function getMarketingTours(): Promise<MarketingTourWithTranslations[]> {
  const supabase = createServerSupabase()

  const { data: tours, error: toursError } = await supabase
    .from('tour_marketing')
    .select('*')
    .order('sort_order', { ascending: true })

  if (toursError) throw toursError

  const { data: translations, error: translationsError } = await supabase
    .from('tour_marketing_translations')
    .select('*')

  if (translationsError) throw translationsError

  return (tours ?? []).map((tour: any) => {
    const byLocale = (translations ?? []).filter((item: any) => item.tour_slug === tour.slug)

    return {
      ...tour,
      translations: {
        nl: byLocale.find((item: any) => item.locale === 'nl') ?? null,
        en: byLocale.find((item: any) => item.locale === 'en') ?? null,
        de: byLocale.find((item: any) => item.locale === 'de') ?? null,
      },
    }
  })
}

function pointsToTextarea(points?: string[]) {
  return Array.isArray(points) ? points.join('\n') : ''
}

function TourEditor({ tour }: { tour: MarketingTourWithTranslations }) {
  const nl = tour.translations.nl
  const en = tour.translations.en
  const de = tour.translations.de

  return (
    <form
      action={updateMarketingTourAction}
      className="rounded-[2rem] border border-[#dbecef] bg-white p-5 shadow-[0_24px_70px_rgba(15,75,88,0.08)]"
    >
      <input type="hidden" name="slug" value={tour.slug} />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5a8d93]">
            Marketing tour
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-[#143a43]">{tour.slug}</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-[#eef8f8] px-3 py-1 text-sm font-medium text-[#4c7177]">
            Volgorde: {tour.sort_order}
          </span>
          <span className="rounded-full bg-[#f2f6f6] px-3 py-1 text-sm font-medium text-[#4c7177]">
            {tour.available ? 'Beschikbaar' : 'Binnenkort'}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#143a43]">Afbeelding URL</span>
          <input
            name="image_url"
            defaultValue={tour.image_url}
            className="w-full rounded-2xl border border-[#dbecef] bg-white px-4 py-3 text-sm text-[#143a43]"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#143a43]">Sorteervolgorde</span>
          <input
            name="sort_order"
            type="number"
            defaultValue={tour.sort_order}
            className="w-full rounded-2xl border border-[#dbecef] bg-white px-4 py-3 text-sm text-[#143a43]"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#143a43]">Beschikbaar</span>
          <select
            name="available"
            defaultValue={String(tour.available)}
            className="w-full rounded-2xl border border-[#dbecef] bg-white px-4 py-3 text-sm text-[#143a43]"
          >
            <option value="true">Ja</option>
            <option value="false">Nee</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[#143a43]">Featured</span>
          <select
            name="featured"
            defaultValue={String(tour.featured)}
            className="w-full rounded-2xl border border-[#dbecef] bg-white px-4 py-3 text-sm text-[#143a43]"
          >
            <option value="true">Ja</option>
            <option value="false">Nee</option>
          </select>
        </label>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {[
          { key: 'nl', label: 'Nederlands', data: nl },
          { key: 'en', label: 'English', data: en },
          { key: 'de', label: 'Deutsch', data: de },
        ].map((locale) => (
          <div key={locale.key} className="rounded-[1.5rem] border border-[#e7f1f2] bg-[#fbfdfd] p-4">
            <h3 className="text-lg font-semibold text-[#143a43]">{locale.label}</h3>

            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#143a43]">Titel</span>
                <input
                  name={`title_${locale.key}`}
                  defaultValue={locale.data?.title ?? ''}
                  className="w-full rounded-2xl border border-[#dbecef] bg-white px-4 py-3 text-sm text-[#143a43]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#143a43]">Badge</span>
                <input
                  name={`badge_${locale.key}`}
                  defaultValue={locale.data?.badge ?? ''}
                  className="w-full rounded-2xl border border-[#dbecef] bg-white px-4 py-3 text-sm text-[#143a43]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#143a43]">Duur label</span>
                <input
                  name={`duration_label_${locale.key}`}
                  defaultValue={locale.data?.duration_label ?? ''}
                  className="w-full rounded-2xl border border-[#dbecef] bg-white px-4 py-3 text-sm text-[#143a43]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#143a43]">CTA</span>
                <input
                  name={`cta_${locale.key}`}
                  defaultValue={locale.data?.cta ?? ''}
                  className="w-full rounded-2xl border border-[#dbecef] bg-white px-4 py-3 text-sm text-[#143a43]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#143a43]">
                  Punten, 1 per regel
                </span>
                <textarea
                  name={`points_${locale.key}`}
                  defaultValue={pointsToTextarea(locale.data?.points)}
                  rows={6}
                  className="w-full rounded-2xl border border-[#dbecef] bg-white px-4 py-3 text-sm text-[#143a43]"
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-2xl bg-[#0f4b58] px-5 py-3 font-semibold text-white transition hover:opacity-90"
        >
          Opslaan
        </button>
      </div>
    </form>
  )
}

export default async function MarketingToursAdminPage() {
  const tours = await getMarketingTours()

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <div className="rounded-[2rem] border border-[#dbecef] bg-white p-5 shadow-[0_24px_70px_rgba(15,75,88,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5a8d93]">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-[#143a43]">Marketing tours</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#5b757b]">
              Beheer hier centraal de tourkaarten voor website en app. Alles wat je hier aanpast,
              loopt direct mee op beide plekken.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex rounded-2xl border border-[#dce8e9] bg-[#f8fbfb] px-5 py-3 font-semibold text-[#0f4b58]"
          >
            Terug naar admin
          </Link>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {tours.map((tour) => (
          <TourEditor key={tour.slug} tour={tour} />
        ))}
      </div>
    </main>
  )
}