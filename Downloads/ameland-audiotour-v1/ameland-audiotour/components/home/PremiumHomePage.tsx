import Link from 'next/link'
import Image from 'next/image'
import { cookies } from 'next/headers'

type Lang = 'nl' | 'de' | 'en'

async function getLang(): Promise<Lang> {
  const cookieStore = await cookies()
  const value =
    cookieStore.get('ameland-audiotours-language')?.value ||
    cookieStore.get('NEXT_LOCALE')?.value

  if (value === 'de' || value === 'en' || value === 'nl') return value
  return 'nl'
}

const copy = {
  nl: {
    eyebrow: 'Audiotours op Ameland',
    title: 'Beleef Ameland met gevoel.',
    text: 'Route, verhaal en sfeer komen samen in een rustige audiotour op je telefoon.',
    cta: 'Bekijk tours',
    how: 'Hoe het werkt',
    steps: [
      ['Kies', 'Kies jouw tour', 'Kies de route die past bij jouw dag op Ameland.'],
      ['Open', 'Bestel direct online', 'Open de tour eenvoudig op je telefoon en start wanneer je wilt.'],
      ['Beleef', 'Ga op pad', 'Ontdek dorp, duin en landschap met verhalen onderweg.'],
    ],
    blockEyebrow: 'Van kiezen naar beleven',
    blockTitle:
      'Alles is opgezet om je soepel van stap naar stap te brengen. Daardoor voelt starten eenvoudig, logisch en uitnodigend.',
    safety:
      'Luister veilig met één oortje of open-ear audio en houd aandacht voor verkeer en je omgeving.',
    start: 'Start jouw audiotour',
  },
  de: {
    eyebrow: 'Audiotouren auf Ameland',
    title: 'Erlebe Ameland mit Gefühl.',
    text: 'Route, Geschichte und Atmosphäre kommen in einer ruhigen Audiotour auf deinem Handy zusammen.',
    cta: 'Touren ansehen',
    how: 'So funktioniert es',
    steps: [
      ['Wählen', 'Wähle deine Tour', 'Wähle die Route, die zu deinem Tag auf Ameland passt.'],
      ['Öffnen', 'Direkt online buchen', 'Öffne die Tour einfach auf deinem Handy und starte, wann du möchtest.'],
      ['Erleben', 'Mach dich auf den Weg', 'Entdecke Dorf, Dünen und Landschaft mit Geschichten unterwegs.'],
    ],
    blockEyebrow: 'Vom Wählen zum Erleben',
    blockTitle:
      'Alles ist so aufgebaut, dass du ruhig und einfach starten kannst. Schritt für Schritt.',
    safety:
      'Höre sicher mit einem Ohrhörer oder Open-Ear-Audio und achte weiter auf Verkehr und Umgebung.',
    start: 'Audiotour starten',
  },
  en: {
    eyebrow: 'Audio tours on Ameland',
    title: 'Experience Ameland with feeling.',
    text: 'Route, story and atmosphere come together in a calm audio tour on your phone.',
    cta: 'View tours',
    how: 'How it works',
    steps: [
      ['Choose', 'Choose your story', 'Pick the route that fits your day on Ameland.'],
      ['Open', 'Book online', 'Open the tour on your phone and start whenever you like.'],
      ['Experience', 'Head out', 'Discover village, dunes and landscape with stories along the way.'],
    ],
    blockEyebrow: 'From choosing to experiencing',
    blockTitle:
      'Everything is designed to guide you smoothly from step to step, so starting feels simple and inviting.',
    safety:
      'Listen safely with one earbud or open-ear audio and stay aware of traffic and your surroundings.',
    start: 'Start your audio tour',
  },
} satisfies Record<Lang, any>

export default async function PremiumHomePage() {
  const lang = await getLang()
  const t = copy[lang]

  return (
    <main
      style={{
        minHeight: '100svh',
        background:
          'radial-gradient(circle at 16% 0%, rgba(229,239,224,0.95) 0, transparent 34%), linear-gradient(180deg,#f4efe4 0%,#eee6d9 100%)',
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
              position: 'relative',
              overflow: 'hidden',
              padding: '34px 24px 30px',
              background:
                'radial-gradient(circle at 88% 0%, #e9f2e4 0, transparent 36%), linear-gradient(180deg,#ffffff 0%,#fbf6ec 100%)',
            }}
          >
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                <Image src="/images/ameland-audiotours-logo.webp" alt="Ameland Audiotours logo" width={76} height={76} priority style={{ borderRadius: 999, objectFit: 'cover', boxShadow: '0 14px 32px rgba(15,93,103,.18)' }} />
                <strong style={{ maxWidth: 180, color: '#164c58', fontSize: 17, lineHeight: 1.1, letterSpacing: '-0.02em' }}>Ameland Audiotours</strong>
              </div>
              <p style={{ margin: 0, color: '#7a8875', fontSize: 11, fontWeight: 950, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
                {t.eyebrow}
              </p>

              <h1 style={{ margin: '12px 0 0', maxWidth: 390, color: '#20372f', fontSize: 'clamp(41px, 10.4vw, 58px)', lineHeight: 0.91, letterSpacing: '-0.067em', fontWeight: 950 }}>
                {t.title}
              </h1>

              <p style={{ margin: '18px 0 0', maxWidth: 370, color: '#626b61', fontSize: 18, lineHeight: 1.45, fontWeight: 520 }}>
                {t.text}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 25 }}>
                <Link href={`/tours?lang=${lang}`} style={{ height: 56, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#c96643', color: '#fff', textDecoration: 'none', fontWeight: 950, boxShadow: '0 15px 32px rgba(201,102,67,0.25)' }}>
                  {t.cta}
                </Link>

                <a href="#hoe-het-werkt" style={{ height: 56, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.86)', border: '1px solid #e2d9ca', color: '#31473d', textDecoration: 'none', fontWeight: 950 }}>
                  {t.how}
                </a>
              </div>
            </div>
          </div>

          <div id="hoe-het-werkt" style={{ padding: '22px 22px 0', background: '#fffdf8' }}>
            <div style={{ borderRadius: 30, background: '#f7f2e8', border: '1px solid #eee6d8', overflow: 'hidden' }}>
              {t.steps.map((step: string[], index: number) => (
                <div key={step[0]} style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 14, padding: '18px', borderTop: index === 0 ? 'none' : '1px solid #eee6d8', alignItems: 'start' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 999, background: index === 0 ? '#0f5d67' : '#fffdf8', color: index === 0 ? '#fff' : '#315848', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 950, boxShadow: '0 6px 14px rgba(31,39,32,0.07)' }}>
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div>
                    <p style={{ margin: 0, color: '#7a8875', fontSize: 11, fontWeight: 950, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                      {step[0]}
                    </p>
                    <h2 style={{ margin: '5px 0 0', color: '#20372f', fontSize: 19, lineHeight: 1.12, letterSpacing: '-0.03em', fontWeight: 950 }}>
                      {step[1]}
                    </h2>
                    <p style={{ margin: '6px 0 0', color: '#657064', fontSize: 14, lineHeight: 1.45, fontWeight: 650 }}>
                      {step[2]}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, borderRadius: 28, background: '#edf5ea', padding: 20 }}>
              <p style={{ margin: 0, color: '#7a8875', fontSize: 11, fontWeight: 950, letterSpacing: '0.21em', textTransform: 'uppercase' }}>
                {t.blockEyebrow}
              </p>
              <p style={{ margin: '12px 0 0', color: '#20372f', fontSize: 17, lineHeight: 1.35, fontWeight: 900 }}>
                {t.blockTitle}
              </p>
              <p style={{ margin: '16px 0 0', paddingTop: 14, borderTop: '1px solid #dbe8d7', color: '#58695d', fontSize: 13, lineHeight: 1.45, fontWeight: 650 }}>
                {t.safety}
              </p>
            </div>

            <Link href={`/tours?lang=${lang}`} style={{ marginTop: 16, height: 58, borderRadius: 21, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f5d67', color: '#fff', textDecoration: 'none', fontWeight: 950, boxShadow: '0 15px 32px rgba(15,93,103,0.18)' }}>
              {t.start}
            </Link>
          </div>

          <div style={{ height: 22, background: '#fffdf8' }} />
        </section>

        <p style={{ margin: '28px 0 0', textAlign: 'center', color: '#8a867d', fontSize: 12, fontWeight: 750 }}>
          © Ameland Audiotours
        </p>
      </div>
    </main>
  )
}
