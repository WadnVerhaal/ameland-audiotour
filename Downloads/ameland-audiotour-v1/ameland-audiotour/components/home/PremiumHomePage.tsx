import Link from 'next/link'
import Image from 'next/image'
import { cookies } from 'next/headers'
import {
  CheckCircle2,
  Clock3,
  Headphones,
  Map,
  MapPin,
  Navigation,
  PlayCircle,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react'

type Lang = 'nl' | 'de' | 'en'

const PREVIEW_AUDIO =
  'https://judnkscpszrdxlzauewo.supabase.co/storage/v1/object/sign/Fietsen%20door%20Hollum/Stop%201.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83OTVkNjY5NC01ZWFmLTRhZTctOTVlOS01ZTQ3N2I0OWZkMWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJGaWV0c2VuIGRvb3IgSG9sbHVtL1N0b3AgMS5tcDMiLCJpYXQiOjE3NzU4MzE2MDUsImV4cCI6MjYzOTc0NTIwNX0.ED7wcHVzQRkiAiSSlV8C2hTyFb833DCeC7p-VzMNkmw'

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
    eyebrow: 'Jouw persoonlijke eilandgids',
    title: 'Hoor Ameland zoals je het nog nooit beleefde.',
    text: 'Wandel op je eigen tempo door Hollum. Je telefoon wijst de weg en op bijzondere plekken beginnen de verhalen vanzelf.',
    cta: 'Bekijk de audiotour',
    preview: 'Luister naar een voorproefje',
    previewText: 'Zet je geluid aan en ervaar direct de rustige vertelstijl van de tour.',
    trust: ['Professioneel ingesproken', 'GPS-begeleiding onderweg', 'Start wanneer het jou uitkomt'],
    facts: [
      ['9', 'bijzondere verhalen'],
      ['± 90 min', 'wandelen en luisteren'],
      ['NL · EN · DE', 'beschikbare talen'],
    ],
    how: 'Zo werkt het',
    steps: [
      ['Kies', 'Bestel de tour', 'Na je betaling ontvang je direct een persoonlijke toegangsknop.'],
      ['Open', 'Start op je telefoon', 'Geen app-installatie nodig. Locatie aan, oortjes in en gaan.'],
      ['Beleef', 'Volg je eilandgids', 'De kaart brengt je naar de volgende stop en de audio start bij aankomst.'],
    ],
    featureTitle: 'Alles wat je nodig hebt voor een ontspannen ontdekkingstocht',
    features: [
      ['Persoonlijke navigatie', 'Je ziet alleen de volgende relevante stop en de beste wandelroute ernaartoe.'],
      ['Automatische voortgang', 'De tour onthoudt waar je bent gebleven en welke verhalen je al hebt gehoord.'],
      ['Echte eilandverhalen', 'Cultuur, zeevaart, reddingswerk en het leven in Hollum komen samen.'],
      ['Veilig onderweg', 'Luister met één oortje of open-ear audio en houd zicht op je omgeving.'],
    ],
    quote: 'Niet alleen kijken waar je loopt, maar horen waarom die plek bijzonder is.',
    start: 'Start jouw ontdekking van Hollum',
    route: 'Van dorpsstraat naar duin en vuurtoren',
  },
  de: {
    eyebrow: 'Dein persönlicher Inselguide',
    title: 'Höre Ameland, wie du es noch nie erlebt hast.',
    text: 'Spaziere in deinem eigenen Tempo durch Hollum. Dein Handy zeigt den Weg und an besonderen Orten beginnen die Geschichten automatisch.',
    cta: 'Audiotour ansehen',
    preview: 'Hör dir eine Vorschau an',
    previewText: 'Schalte den Ton ein und erlebe direkt den ruhigen Erzählstil der Tour.',
    trust: ['Professionell eingesprochen', 'GPS-Begleitung unterwegs', 'Start, wann du möchtest'],
    facts: [['9', 'besondere Geschichten'], ['ca. 90 Min.', 'wandern und hören'], ['NL · EN · DE', 'verfügbare Sprachen']],
    how: 'So funktioniert es',
    steps: [
      ['Wählen', 'Tour buchen', 'Nach der Zahlung erhältst du sofort deinen persönlichen Zugang.'],
      ['Öffnen', 'Auf dem Handy starten', 'Keine App nötig. Standort an, Kopfhörer auf und los.'],
      ['Erleben', 'Dem Inselguide folgen', 'Die Karte führt dich zum nächsten Stopp, die Audio startet bei Ankunft.'],
    ],
    featureTitle: 'Alles für eine entspannte Entdeckungstour',
    features: [
      ['Persönliche Navigation', 'Du siehst den nächsten relevanten Stopp und die passende Fußroute.'],
      ['Automatischer Fortschritt', 'Die Tour merkt sich, wo du warst und welche Geschichten du gehört hast.'],
      ['Echte Inselgeschichten', 'Kultur, Seefahrt, Rettungswesen und das Leben in Hollum werden lebendig.'],
      ['Sicher unterwegs', 'Höre mit einem Ohrhörer oder Open-Ear-Audio und achte auf deine Umgebung.'],
    ],
    quote: 'Nicht nur sehen, wo du gehst, sondern hören, warum dieser Ort besonders ist.',
    start: 'Entdecke Hollum',
    route: 'Vom Dorf über die Dünen bis zum Leuchtturm',
  },
  en: {
    eyebrow: 'Your personal island guide',
    title: 'Hear Ameland as you have never experienced it before.',
    text: 'Explore Hollum at your own pace. Your phone guides the way and the stories begin automatically at special places.',
    cta: 'View the audio tour',
    preview: 'Listen to a preview',
    previewText: 'Turn on your sound and experience the calm narration style of the tour.',
    trust: ['Professionally narrated', 'GPS guidance along the way', 'Start whenever it suits you'],
    facts: [['9', 'remarkable stories'], ['about 90 min', 'walking and listening'], ['NL · EN · DE', 'available languages']],
    how: 'How it works',
    steps: [
      ['Choose', 'Book the tour', 'After payment you immediately receive your personal access link.'],
      ['Open', 'Start on your phone', 'No app installation. Enable location, put in your earbuds and go.'],
      ['Experience', 'Follow your island guide', 'The map leads to the next stop and audio starts when you arrive.'],
    ],
    featureTitle: 'Everything you need for a relaxed discovery walk',
    features: [
      ['Personal navigation', 'See the next relevant stop and the best walking route to reach it.'],
      ['Automatic progress', 'The tour remembers where you left off and which stories you have heard.'],
      ['Authentic island stories', 'Culture, seafaring, rescue work and life in Hollum come together.'],
      ['Safe on the road', 'Use one earbud or open-ear audio and stay aware of your surroundings.'],
    ],
    quote: 'Do not just see where you walk. Hear why that place matters.',
    start: 'Start discovering Hollum',
    route: 'From village streets to dunes and lighthouse',
  },
} satisfies Record<Lang, any>

const featureIcons = [Navigation, Smartphone, Sparkles, ShieldCheck]

export default async function PremiumHomePage() {
  const lang = await getLang()
  const t = copy[lang]

  return (
    <main className="min-h-screen overflow-hidden bg-[#f3eee4] text-[#20372f]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(216,235,214,.9),transparent_32%),radial-gradient(circle_at_90%_18%,rgba(190,221,226,.55),transparent_28%)]" />

      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-full border border-[#dcd2c1] bg-white/80 px-4 py-3 shadow-sm backdrop-blur sm:px-5">
          <div className="flex items-center gap-3">
            <Image src="/images/ameland-audiotours-logo.webp" alt="Ameland Audiotours" width={54} height={54} priority className="h-12 w-12 rounded-full object-cover shadow-md" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.22em] text-[#6d7e70]">Ameland</p>
              <strong className="text-base font-black tracking-tight text-[#164c58]">Audiotours</strong>
            </div>
          </div>
          <Link href={`/tours?lang=${lang}`} className="rounded-full bg-[#0f5d67] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#0f5d67]/15 transition hover:-translate-y-0.5">
            {t.cta}
          </Link>
        </header>

        <section className="mt-4 overflow-hidden rounded-[2.4rem] border border-[#d9cfbe] bg-[#fffdf8] shadow-[0_32px_90px_rgba(36,51,43,.14)]">
          <div className="grid lg:grid-cols-[1.08fr_.92fr]">
            <div className="p-6 sm:p-10 lg:p-14">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#eaf3e7] px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-[#426153]">
                <MapPin className="h-4 w-4" /> {t.eyebrow}
              </div>
              <h1 className="mt-6 max-w-3xl text-[clamp(3.2rem,8vw,6.5rem)] font-black leading-[.86] tracking-[-.07em] text-[#20372f]">
                {t.title}
              </h1>
              <p className="mt-7 max-w-2xl text-lg font-medium leading-8 text-[#626b61] sm:text-xl">{t.text}</p>

              <div className="mt-7 grid gap-2 sm:grid-cols-3">
                {t.trust.map((item: string) => (
                  <div key={item} className="flex items-center gap-2 rounded-2xl bg-[#f7f2e8] px-3 py-3 text-sm font-bold text-[#395247]">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#c96643]" /> {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={`/tours?lang=${lang}`} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#c96643] px-7 py-4 font-black text-white shadow-xl shadow-[#c96643]/20 transition hover:-translate-y-0.5">
                  <Headphones className="h-5 w-5" /> {t.cta}
                </Link>
                <a href="#preview" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-[#ddd3c3] bg-white px-7 py-4 font-black text-[#31473d] transition hover:bg-[#f7f2e8]">
                  <PlayCircle className="h-5 w-5" /> {t.preview}
                </a>
              </div>
            </div>

            <div className="relative min-h-[430px] overflow-hidden bg-[linear-gradient(155deg,#0f5d67_0%,#174852_48%,#172f2f_100%)] p-6 text-white sm:p-9 lg:min-h-full">
              <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#e6c876]/20 blur-3xl" />
              <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#86c7cc]/20 blur-3xl" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex justify-end">
                  <Image src="/images/ameland-audiotours-logo.webp" alt="" width={190} height={190} className="h-40 w-40 rounded-full border-8 border-white/10 object-cover shadow-2xl sm:h-48 sm:w-48" />
                </div>
                <div>
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[.2em] text-[#d9f1e3]">
                    <Map className="h-4 w-4" /> {t.route}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {t.facts.map((fact: string[]) => (
                      <div key={fact[1]} className="rounded-2xl border border-white/10 bg-white/[.08] p-3 backdrop-blur">
                        <p className="text-lg font-black tracking-tight">{fact[0]}</p>
                        <p className="mt-1 text-xs leading-5 text-white/65">{fact[1]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="preview" className="mt-5 grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
          <article className="rounded-[2rem] border border-[#d9cfbe] bg-[#20372f] p-6 text-white shadow-xl sm:p-8">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#d9edda] text-[#20372f]"><PlayCircle className="h-7 w-7" /></div>
              <div>
                <p className="text-xs font-black uppercase tracking-[.2em] text-[#a9c7b8]">Audio preview</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight">{t.preview}</h2>
              </div>
            </div>
            <p className="mt-4 leading-7 text-white/70">{t.previewText}</p>
            <audio className="mt-6 w-full" controls preload="metadata" src={PREVIEW_AUDIO} />
          </article>

          <article className="rounded-[2rem] border border-[#d9cfbe] bg-white/75 p-6 shadow-xl backdrop-blur sm:p-8">
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#7a8875]">{t.how}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {t.steps.map((step: string[], index: number) => (
                <div key={step[0]} className="rounded-[1.4rem] bg-[#f7f2e8] p-4">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[#0f5d67] text-sm font-black text-white">{index + 1}</div>
                  <p className="mt-4 text-[10px] font-black uppercase tracking-[.18em] text-[#819080]">{step[0]}</p>
                  <h3 className="mt-1 text-lg font-black tracking-tight">{step[1]}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#657064]">{step[2]}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-5 rounded-[2.2rem] border border-[#d9cfbe] bg-[#fffdf8] p-6 shadow-xl sm:p-9">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#7a8875]">Ameland Audiotours</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-.04em] sm:text-5xl">{t.featureTitle}</h2>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {t.features.map((feature: string[], index: number) => {
              const Icon = featureIcons[index]
              return (
                <article key={feature[0]} className="rounded-[1.6rem] border border-[#ece3d4] bg-[#f8f4eb] p-5">
                  <Icon className="h-7 w-7 text-[#c96643]" />
                  <h3 className="mt-4 text-xl font-black tracking-tight">{feature[0]}</h3>
                  <p className="mt-2 leading-7 text-[#657064]">{feature[1]}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-[2.2rem] bg-[#c96643] p-7 text-white shadow-2xl sm:p-10">
          <div className="grid items-center gap-7 lg:grid-cols-[1fr_auto]">
            <div>
              <Sparkles className="h-8 w-8 text-[#ffe6a8]" />
              <blockquote className="mt-5 max-w-3xl text-3xl font-black leading-tight tracking-[-.04em] sm:text-5xl">“{t.quote}”</blockquote>
              <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold text-white/80">
                <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" /> ± 90 min</span>
                <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> Hollum</span>
                <span className="inline-flex items-center gap-2"><Headphones className="h-4 w-4" /> Smartphone + oortjes</span>
              </div>
            </div>
            <Link href={`/tours?lang=${lang}`} className="inline-flex min-h-16 items-center justify-center rounded-2xl bg-white px-8 py-4 text-center font-black text-[#9d452d] shadow-xl transition hover:-translate-y-0.5">
              {t.start}
            </Link>
          </div>
        </section>

        <footer className="mt-8 flex flex-col items-center justify-between gap-3 text-center text-xs font-bold text-[#7c7a72] sm:flex-row sm:text-left">
          <span>© Ameland Audiotours</span>
          <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Veilig betalen · directe toegang · persoonlijke ondersteuning</span>
        </footer>
      </div>
    </main>
  )
}
