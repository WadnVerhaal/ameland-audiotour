'use client'

type Lang = 'nl' | 'de' | 'en'

type Props = {
  onContinue?: () => void
  onShowPartner?: () => void
  showPartnerButton?: boolean
  onStartWithoutPartner?: () => void
  onStartWithPartner?: () => void
}

function getLang(): Lang {
  if (typeof window === 'undefined') return 'nl'

  const fromUrl = new URLSearchParams(window.location.search).get('lang')
  const stored = window.localStorage.getItem('ameland-audiotours-language')

  if (fromUrl === 'de' || fromUrl === 'en' || fromUrl === 'nl') return fromUrl
  if (stored === 'de' || stored === 'en' || stored === 'nl') return stored
  return 'nl'
}

const copy = {
  nl: {
    eyebrow: 'Voor vertrek',
    title: 'Klaar om te luisteren?',
    text: 'Gebruik bij voorkeur één oortje of open-ear audio. Zo hoor je het verhaal én blijf je alert op je omgeving.',
    tip: 'Tip onderweg',
    noEarbuds: 'Geen oortjes bij je?',
    partner: 'Voeg Warenhuis Engels toe als korte voorbereidingsstop.',
    address: 'Zwanenplein 1, 9161 BS Hollum',
    start: 'Start mijn tour →',
    add: 'Voeg voorbereidingsstop toe',
    safe: 'Pauzeren of terugspoelen kan altijd. Luister opnieuw op een rustig en veilig moment.',
  },
  de: {
    eyebrow: 'Vor dem Start',
    title: 'Bereit zum Zuhören?',
    text: 'Nutze am besten einen Ohrhörer oder Open-Ear-Audio. So hörst du die Geschichte und bleibst aufmerksam.',
    tip: 'Tipp unterwegs',
    noEarbuds: 'Keine Ohrhörer dabei?',
    partner: 'Füge Warenhuis Engels als kurzen Vorbereitungsstopp hinzu.',
    address: 'Zwanenplein 1, 9161 BS Hollum',
    start: 'Tour starten →',
    add: 'Vorbereitungsstopp hinzufügen',
    safe: 'Pausieren oder Zurückspulen ist jederzeit möglich. Höre später an einem sicheren Ort erneut.',
  },
  en: {
    eyebrow: 'Before you start',
    title: 'Ready to listen?',
    text: 'Use one earbud or open-ear audio if possible. That way you hear the story and stay aware of your surroundings.',
    tip: 'On-the-go tip',
    noEarbuds: 'No earbuds with you?',
    partner: 'Add Warenhuis Engels as a short preparation stop.',
    address: 'Zwanenplein 1, 9161 BS Hollum',
    start: 'Start my tour →',
    add: 'Add preparation stop',
    safe: 'You can pause or rewind anytime. Listen again later at a safe moment.',
  },
} satisfies Record<Lang, Record<string, string>>

export default function PreTourAudioCheck({
  onContinue,
  onShowPartner,
  showPartnerButton = true,
  onStartWithoutPartner,
  onStartWithPartner,
}: Props) {
  const lang = getLang()
  const txt = copy[lang]
  const handleStart = onContinue || onStartWithoutPartner
  const handlePartner = onShowPartner || onStartWithPartner

  return (
    <main
      style={{
        minHeight: '100svh',
        background:
          'radial-gradient(circle at 18% 0%, rgba(229,239,224,0.95) 0, transparent 34%), linear-gradient(180deg,#f4efe4 0%,#eee6d9 100%)',
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
              padding: '32px 24px 26px',
              background:
                'radial-gradient(circle at 88% 0%, #e9f2e4 0, transparent 36%), linear-gradient(180deg,#ffffff 0%,#fbf6ec 100%)',
            }}
          >
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 20,
                  background: '#0f5d67',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 25,
                  marginBottom: 18,
                  boxShadow: '0 14px 30px rgba(15,93,103,0.18)',
                }}
              >
                ♫
              </div>

              <p
                style={{
                  margin: 0,
                  color: '#7a8875',
                  fontSize: 11,
                  fontWeight: 950,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                }}
              >
                {txt.eyebrow}
              </p>

              <h1
                style={{
                  margin: '10px 0 0',
                  maxWidth: 390,
                  color: '#20372f',
                  fontSize: 'clamp(38px, 9.8vw, 52px)',
                  lineHeight: 0.94,
                  letterSpacing: '-0.062em',
                  fontWeight: 950,
                }}
              >
                {txt.title}
              </h1>

              <p
                style={{
                  margin: '16px 0 0',
                  maxWidth: 380,
                  color: '#626b61',
                  fontSize: 17,
                  lineHeight: 1.45,
                  fontWeight: 560,
                }}
              >
                {txt.text}
              </p>
            </div>
          </div>

          <div style={{ padding: '22px', background: '#fffdf8' }}>
            <div
              style={{
                borderRadius: 30,
                background: '#f7f2e8',
                border: '1px solid #eee6d8',
                padding: 18,
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: '#7a8875',
                  fontSize: 11,
                  fontWeight: 950,
                  letterSpacing: '0.20em',
                  textTransform: 'uppercase',
                }}
              >
                {txt.tip}
              </p>

              <p
                style={{
                  margin: '10px 0 0',
                  color: '#20372f',
                  fontSize: 18,
                  lineHeight: 1.28,
                  fontWeight: 950,
                  letterSpacing: '-0.025em',
                }}
              >
                {txt.noEarbuds}
              </p>

              <p
                style={{
                  margin: '8px 0 0',
                  color: '#626b61',
                  fontSize: 14,
                  lineHeight: 1.45,
                  fontWeight: 650,
                }}
              >
                {txt.partner}
              </p>

              <p
                style={{
                  margin: '12px 0 0',
                  color: '#8a867d',
                  fontSize: 13,
                  lineHeight: 1.35,
                  fontWeight: 750,
                }}
              >
                {txt.address}
              </p>
            </div>

            <button
              type="button"
              onClick={handleStart}
              style={{
                marginTop: 16,
                width: '100%',
                height: 58,
                border: 0,
                borderRadius: 21,
                background: '#0f5d67',
                color: '#fff',
                fontSize: 16,
                fontWeight: 950,
                boxShadow: '0 15px 32px rgba(15,93,103,0.18)',
              }}
            >
              {txt.start}
            </button>

            {showPartnerButton && (
              <button
                type="button"
                onClick={handlePartner}
                style={{
                  marginTop: 12,
                  width: '100%',
                  height: 54,
                  borderRadius: 20,
                  border: '1px solid #e2d9ca',
                  background: 'rgba(255,255,255,0.86)',
                  color: '#31473d',
                  fontSize: 15,
                  fontWeight: 950,
                }}
              >
                {txt.add}
              </button>
            )}

            <div
              style={{
                marginTop: 16,
                borderRadius: 24,
                background: '#edf5ea',
                padding: 16,
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: '#58695d',
                  fontSize: 13,
                  lineHeight: 1.45,
                  fontWeight: 700,
                }}
              >
                {txt.safe}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export { PreTourAudioCheck }
