import Link from 'next/link'
import {
  asNumber,
  asText,
  getAvailableTours,
  getTourSlug,
  upcomingTours,
} from '@/lib/tour-catalog'

export const dynamic = 'force-dynamic'

type Lang = 'nl' | 'de' | 'en'

function getLang(searchParams?: { lang?: string }): Lang {
  return searchParams?.lang === 'de' || searchParams?.lang === 'en' ? searchParams.lang : 'nl'
}

function durationLabel(tour: Record<string, any>) {
  const minutes = asNumber(tour.duration_minutes)
  if (minutes) return `${minutes} min`
  return asText(tour.duration, '90 min')
}

function distanceLabel(tour: Record<string, any>) {
  const km = asNumber(tour.distance_km)
  if (km) return `± ${String(km).replace('.', ',')} km`
  return asText(tour.distance, '± 3 km')
}

const copy = {
  nl: {
    back: '← Terug naar begin',
    eyebrow: 'Tours',
    title: 'Kies de tour die bij jouw dag past',
    intro: 'Beschikbare tours kun je direct starten. De andere routes komen binnenkort online.',
    available: 'Nu beschikbaar',
    availablePill: 'Beschikbaar',
    comingSoon: 'Binnenkort',
    emptyTitle: 'Nog geen actieve tour gevonden',
    emptyText: 'Zet in Supabase minimaal één tour actief met een slug. Dan verschijnt hij hier automatisch.',
    fallbackSubtitle: 'Een rustige audiotour langs bijzondere plekken op Ameland.',
    footer: '© Ameland Audiotours',
  },
  de: {
    back: '← Zurück zum Start',
    eyebrow: 'Touren',
    title: 'Wähle die Tour, die zu deinem Tag passt',
    intro: 'Verfügbare Touren kannst du direkt starten. Weitere Routen kommen bald online.',
    available: 'Jetzt verfügbar',
    availablePill: 'Verfügbar',
    comingSoon: 'Bald verfügbar',
    emptyTitle: 'Noch keine aktive Tour gefunden',
    emptyText: 'Aktiviere in Supabase mindestens eine Tour mit einem Slug. Dann erscheint sie hier automatisch.',
    fallbackSubtitle: 'Eine ruhige Audiotour entlang besonderer Orte auf Ameland.',
    footer: '© Ameland Audiotours',
  },
  en: {
    back: '← Back to start',
    eyebrow: 'Tours',
    title: 'Choose the tour that fits your day',
    intro: 'Available tours can be started right away. More routes are coming soon.',
    available: 'Available now',
    availablePill: 'Available',
    comingSoon: 'Coming soon',
    emptyTitle: 'No active tour found yet',
    emptyText: 'Activate at least one tour with a slug in Supabase. It will appear here automatically.',
    fallbackSubtitle: 'A calm audio tour along special places on Ameland.',
    footer: '© Ameland Audiotours',
  },
} satisfies Record<Lang, Record<string, string>>

export default async function ToursPage({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const lang = getLang(resolvedSearchParams)
  const t = copy[lang]
  const availableTours = await getAvailableTours()

  return (
    <main
      style={{
        minHeight: '100svh',
        background:
          'radial-gradient(circle at 18% 0%, rgba(231,241,225,0.95) 0, transparent 36%), linear-gradient(180deg,#f4efe4 0%,#eee6d9 100%)',
        color: '#20372f',
        padding: '14px 14px 92px',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ width: '100%', maxWidth: 560, margin: '0 auto' }}>
        <section
          style={{
            overflow: 'hidden',
            borderRadius: 38,
            background: '#fffdf8',
            border: '1px solid #ddd4c4',
            boxShadow: '0 28px 80px rgba(31,39,32,0.13)',
          }}
        >
          <div
            style={{
              padding: '30px 24px 24px',
              background:
                'radial-gradient(circle at 88% 0%, #e9f2e4 0, transparent 36%), linear-gradient(180deg,#ffffff 0%,#fbf6ec 100%)',
            }}
          >
            <Link
              href={`/?lang=${lang}`}
              style={{
                display: 'inline-flex',
                color: '#657064',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 850,
                marginBottom: 18,
              }}
            >
              {t.back}
            </Link>

            <p
              style={{
                margin: 0,
                color: '#7a8875',
                fontSize: 11,
                fontWeight: 950,
                letterSpacing: '0.23em',
                textTransform: 'uppercase',
              }}
            >
              {t.eyebrow}
            </p>

            <h1
              style={{
                margin: '10px 0 0',
                color: '#20372f',
                fontSize: 'clamp(40px, 10vw, 54px)',
                lineHeight: 0.92,
                letterSpacing: '-0.065em',
                fontWeight: 950,
              }}
            >
              {t.title}
            </h1>

            <p
              style={{
                margin: '16px 0 0',
                maxWidth: 380,
                color: '#626b61',
                fontSize: 17,
                lineHeight: 1.45,
                fontWeight: 520,
              }}
            >
              {t.intro}
            </p>
          </div>

          <div style={{ padding: '18px 18px 8px', background: '#fffdf8' }}>
            <p
              style={{
                margin: '0 0 12px',
                color: '#7a8875',
                fontSize: 11,
                fontWeight: 950,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
              }}
            >
              {t.available}
            </p>

            <div style={{ display: 'grid', gap: 13 }}>
              {availableTours.length > 0 ? (
                availableTours.map((tour: Record<string, any>, index: number) => {
                  const slug = getTourSlug(tour)
                  const title = asText(tour.title, index === 0 ? 'Maak kennis met Hollum' : 'Audiotour Ameland')
                  const subtitle =
                    asText(tour.subtitle) ||
                    asText(tour.short_description) ||
                    asText(tour.description, t.fallbackSubtitle)

                  return (
                    <Link
                      key={slug}
                      href={`/checkout/${slug}?lang=${lang}`}
                      style={{
                        display: 'block',
                        borderRadius: 28,
                        border: '1px solid #e3dccf',
                        background: '#fbf8f1',
                        padding: 18,
                        color: '#20372f',
                        textDecoration: 'none',
                        boxShadow: '0 12px 28px rgba(31,39,32,0.05)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 11 }}>
                        <span
                          style={{
                            borderRadius: 999,
                            background: '#e9f2e5',
                            color: '#557257',
                            padding: '6px 10px',
                            fontSize: 11,
                            lineHeight: 1,
                            fontWeight: 950,
                          }}
                        >
                          {t.availablePill}
                        </span>

                        <span style={{ color: '#7a7f74', fontSize: 12, fontWeight: 850 }}>{durationLabel(tour)}</span>
                        <span style={{ color: '#7a7f74', fontSize: 12, fontWeight: 850 }}>{distanceLabel(tour)}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
                        <div style={{ minWidth: 0 }}>
                          <h2
                            style={{
                              margin: 0,
                              color: '#20372f',
                              fontSize: 22,
                              lineHeight: 1.1,
                              letterSpacing: '-0.035em',
                              fontWeight: 950,
                            }}
                          >
                            {title}
                          </h2>

                          <p
                            style={{
                              margin: '8px 0 0',
                              color: '#626b61',
                              fontSize: 14,
                              lineHeight: 1.45,
                              fontWeight: 650,
                            }}
                          >
                            {subtitle}
                          </p>
                        </div>

                        <span
                          style={{
                            flexShrink: 0,
                            width: 42,
                            height: 42,
                            borderRadius: 999,
                            background: '#fffdf8',
                            color: '#c96643',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 24,
                            fontWeight: 300,
                          }}
                        >
                          →
                        </span>
                      </div>
                    </Link>
                  )
                })
              ) : (
                <div
                  style={{
                    borderRadius: 28,
                    border: '1px solid #e3dccf',
                    background: '#fbf8f1',
                    padding: 18,
                  }}
                >
                  <p style={{ margin: 0, color: '#20372f', fontSize: 18, fontWeight: 950 }}>
                    {t.emptyTitle}
                  </p>
                  <p style={{ margin: '8px 0 0', color: '#626b61', fontSize: 14, lineHeight: 1.45, fontWeight: 650 }}>
                    {t.emptyText}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div style={{ padding: '18px 18px 22px', background: '#fffdf8' }}>
            <p
              style={{
                margin: '0 0 12px',
                color: '#7a8875',
                fontSize: 11,
                fontWeight: 950,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
              }}
            >
              {t.comingSoon}
            </p>

            <div style={{ display: 'grid', gap: 13 }}>
              {upcomingTours.map((tour) => (
                <div
                  key={tour.title}
                  style={{
                    borderRadius: 28,
                    border: '1px solid #eee6d8',
                    background: '#f7f2e8',
                    padding: 18,
                    opacity: 0.92,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 11 }}>
                    <span
                      style={{
                        borderRadius: 999,
                        background: '#efe6d8',
                        color: '#8a6f54',
                        padding: '6px 10px',
                        fontSize: 11,
                        lineHeight: 1,
                        fontWeight: 950,
                      }}
                    >
                      {t.comingSoon}
                    </span>

                    <span style={{ color: '#7a7f74', fontSize: 12, fontWeight: 850 }}>{tour.duration}</span>
                    <span style={{ color: '#7a7f74', fontSize: 12, fontWeight: 850 }}>{tour.distance}</span>
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      color: '#20372f',
                      fontSize: 22,
                      lineHeight: 1.1,
                      letterSpacing: '-0.035em',
                      fontWeight: 950,
                    }}
                  >
                    {tour.title}
                  </h2>

                  <p
                    style={{
                      margin: '8px 0 0',
                      color: '#626b61',
                      fontSize: 14,
                      lineHeight: 1.45,
                      fontWeight: 650,
                    }}
                  >
                    {tour.subtitle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <p
          style={{
            margin: '28px 0 0',
            textAlign: 'center',
            color: '#8a867d',
            fontSize: 12,
            fontWeight: 750,
          }}
        >
          {t.footer}
        </p>
      </div>
    </main>
  )
}
