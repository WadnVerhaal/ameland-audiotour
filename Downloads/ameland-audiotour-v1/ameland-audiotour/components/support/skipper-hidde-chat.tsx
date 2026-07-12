'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import {
  Headphones,
  LifeBuoy,
  LoaderCircle,
  MapPin,
  RotateCcw,
  Send,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react'
import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

type Language = 'nl' | 'en' | 'de'

type SkipperHiddeChatProps = {
  apiEndpoint?: string
  privacyUrl?: string
  avoidMobileBottomBar?: boolean
}

const copy = {
  nl: {
    open: 'Vraag Skipper Hidde',
    title: 'Skipper Hidde',
    subtitle: 'Jouw digitale eilandgids',
    online: 'Aan boord en klaar om te helpen',
    close: 'Chat sluiten',
    reset: 'Nieuw gesprek',
    welcome:
      'Moin! Ik ben Skipper Hidde. Ik ken de routes, de app en de weg terug naar je startlink. Wat kan ik voor je oplossen?',
    placeholder: 'Waar kan ik je mee helpen?',
    send: 'Versturen',
    thinking: 'Skipper Hidde zoekt het voor je uit…',
    error: 'Er ging iets mis op de overtocht. Probeer het gerust nog eens.',
    retry: 'Opnieuw proberen',
    privacy: 'Veilige AI-hulp · deel geen betaalgegevens of wachtwoorden',
    privacyLink: 'Privacy',
    quick: [
      { label: 'Welke tour past bij mij?', prompt: 'Welke audiotour past het beste bij mij?', kind: 'tour' },
      { label: 'Mijn startlink ontbreekt', prompt: 'Ik heb betaald, maar mijn persoonlijke startlink ontbreekt.', kind: 'order' },
      { label: 'Locatie werkt niet', prompt: 'Mijn locatie werkt niet tijdens de tour. Kun je me helpen?', kind: 'location' },
      { label: 'Ik hoor geen audio', prompt: 'Ik hoor geen audio in de tour. Kun je dit met me oplossen?', kind: 'audio' },
    ],
  },
  en: {
    open: 'Ask Skipper Hidde',
    title: 'Skipper Hidde',
    subtitle: 'Your digital island guide',
    online: 'On board and ready to help',
    close: 'Close chat',
    reset: 'New conversation',
    welcome:
      "Moin! I'm Skipper Hidde. I know the routes, the app and the way back to your start link. What can I sort out for you?",
    placeholder: 'How can I help?',
    send: 'Send',
    thinking: 'Skipper Hidde is looking into it…',
    error: 'Something went wrong on the crossing. Please try again.',
    retry: 'Try again',
    privacy: 'Secure AI help · never share payment details or passwords',
    privacyLink: 'Privacy',
    quick: [
      { label: 'Which tour suits me?', prompt: 'Which audio tour would suit me best?', kind: 'tour' },
      { label: 'My start link is missing', prompt: 'I paid, but my personal start link is missing.', kind: 'order' },
      { label: 'Location is not working', prompt: 'My location is not working during the tour. Can you help?', kind: 'location' },
      { label: 'I cannot hear audio', prompt: 'I cannot hear audio in the tour. Can you help me fix it?', kind: 'audio' },
    ],
  },
  de: {
    open: 'Frag Skipper Hidde',
    title: 'Skipper Hidde',
    subtitle: 'Dein digitaler Inselguide',
    online: 'An Bord und bereit zu helfen',
    close: 'Chat schließen',
    reset: 'Neues Gespräch',
    welcome:
      'Moin! Ich bin Skipper Hidde. Ich kenne die Routen, die App und den Weg zurück zu deinem Startlink. Was kann ich für dich lösen?',
    placeholder: 'Wie kann ich dir helfen?',
    send: 'Senden',
    thinking: 'Skipper Hidde klärt das für dich…',
    error: 'Bei der Überfahrt ist etwas schiefgegangen. Bitte versuche es noch einmal.',
    retry: 'Noch einmal versuchen',
    privacy: 'Sichere KI-Hilfe · keine Zahlungsdaten oder Passwörter teilen',
    privacyLink: 'Datenschutz',
    quick: [
      { label: 'Welche Tour passt zu mir?', prompt: 'Welche Audiotour passt am besten zu mir?', kind: 'tour' },
      { label: 'Mein Startlink fehlt', prompt: 'Ich habe bezahlt, aber mein persönlicher Startlink fehlt.', kind: 'order' },
      { label: 'Standort funktioniert nicht', prompt: 'Mein Standort funktioniert während der Tour nicht. Kannst du helfen?', kind: 'location' },
      { label: 'Ich höre keinen Ton', prompt: 'Ich höre in der Tour keinen Ton. Kannst du das mit mir lösen?', kind: 'audio' },
    ],
  },
} as const

function detectLanguage(): Language {
  const pathLanguage = window.location.pathname.split('/')[1]
  if (pathLanguage === 'nl' || pathLanguage === 'en' || pathLanguage === 'de') return pathLanguage

  const queryLanguage = new URLSearchParams(window.location.search).get('lang')
  if (queryLanguage === 'nl' || queryLanguage === 'en' || queryLanguage === 'de') return queryLanguage

  const languageCookie = document.cookie
    .split('; ')
    .find(
      (entry) =>
        entry.startsWith('amelandaudiotours-language=') ||
        entry.startsWith('wadnverhaal-language=') ||
        entry.startsWith('locale=')
    )
    ?.split('=')[1]
  if (languageCookie === 'nl' || languageCookie === 'en' || languageCookie === 'de') return languageCookie

  const browserLanguage = navigator.language.toLowerCase()
  return browserLanguage.startsWith('de') ? 'de' : browserLanguage.startsWith('en') ? 'en' : 'nl'
}

function QuickIcon({ kind }: { kind: string }) {
  if (kind === 'location') return <MapPin className="h-4 w-4" aria-hidden="true" />
  if (kind === 'audio') return <Headphones className="h-4 w-4" aria-hidden="true" />
  if (kind === 'tour') return <Sparkles className="h-4 w-4" aria-hidden="true" />
  return <ShoppingBag className="h-4 w-4" aria-hidden="true" />
}

function SkipperAvatar({ large = false }: { large?: boolean }) {
  return (
    <span
      className={`skipper-hidde-avatar relative grid shrink-0 place-items-center overflow-hidden rounded-full border border-white/70 bg-[#f3dfb9] shadow-lg ${large ? 'h-14 w-14' : 'h-10 w-10'}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" className="h-full w-full" role="img">
        <defs>
          <linearGradient id="hidde-sea" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#dff3ee" />
            <stop offset="1" stopColor="#8fc9c7" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="32" fill="url(#hidde-sea)" />
        <path d="M12 59c3-12 11-18 20-18s17 6 20 18" fill="#0f4b58" />
        <circle cx="32" cy="31" r="14" fill="#efc59c" />
        <path d="M19 27c2-11 24-14 28 0-7-4-21-4-28 0Z" fill="#183f48" />
        <path d="M22 23c3-7 17-9 22-1l-2 3H23Z" fill="#f8f1df" />
        <path d="M19 26h30c-2 3-8 4-15 4s-12-1-15-4Z" fill="#0f4b58" />
        <circle cx="27" cy="32" r="1.3" fill="#20372f" />
        <circle cx="37" cy="32" r="1.3" fill="#20372f" />
        <path d="M25 38c4 4 10 4 14 0-1 7-13 7-14 0Z" fill="#fff7ea" />
        <path d="M17 55c7-5 23-5 30 0" fill="none" stroke="#ef7f63" strokeWidth="4" />
        <path d="M5 53c8-4 14 4 22 0s14 4 32-1" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="2" />
      </svg>
      <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#58c98a]" />
    </span>
  )
}

export function SkipperHiddeChat({
  apiEndpoint = '/api/support/chat',
  privacyUrl = '/privacy',
  avoidMobileBottomBar = false,
}: SkipperHiddeChatProps) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [language] = useState<Language>(() => (typeof window === 'undefined' ? 'nl' : detectLanguage()))
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const transport = useMemo(() => new DefaultChatTransport({ api: apiEndpoint }), [apiEndpoint])
  const {
    messages,
    sendMessage,
    regenerate,
    setMessages,
    clearError,
    status,
    error,
  } = useChat({ transport })
  const t = copy[language]
  const busy = status === 'submitted' || status === 'streaming'
  const requestBody = { locale: language, context: { pathname: typeof window === 'undefined' ? '/' : window.location.pathname } }

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    if (window.innerWidth < 640) document.body.style.overflow = 'hidden'
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  useEffect(() => {
    if (open) chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open, status])

  async function submit(text: string) {
    const message = text.trim().slice(0, 2000)
    if (!message || busy) return
    clearError()
    setInput('')
    await sendMessage({ text: message }, { body: requestBody }).catch(() => undefined)
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void submit(input)
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void submit(input)
    }
  }

  function resetConversation() {
    clearError()
    setMessages([])
    setInput('')
    inputRef.current?.focus()
  }

  const launcherPosition = avoidMobileBottomBar
    ? 'bottom-[5.75rem] md:bottom-6'
    : 'bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-6'
  const panelPosition = avoidMobileBottomBar ? 'sm:bottom-[5.75rem] md:bottom-6' : 'sm:bottom-6'

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`group fixed right-4 z-[70] inline-flex items-center gap-2.5 rounded-full border border-white/80 bg-[#0f4b58] py-2 pl-2 pr-4 text-sm font-bold text-white shadow-[0_18px_50px_rgba(15,75,88,0.38)] transition duration-300 hover:-translate-y-1 hover:bg-[#0b404b] focus:outline-none focus:ring-4 focus:ring-[#9bdad8] sm:right-6 ${launcherPosition}`}
          aria-label={`${t.open} — ${t.title}`}
        >
          <SkipperAvatar />
          <span className="whitespace-nowrap">{t.open}</span>
        </button>
      ) : null}

      {open ? (
        <section
          className={`fixed inset-0 z-[80] flex flex-col overflow-hidden bg-[#edf8f6] shadow-2xl sm:inset-auto sm:right-6 sm:h-[min(700px,calc(100vh-3rem))] sm:w-[420px] sm:rounded-[2rem] sm:border sm:border-[#c8e2e2] ${panelPosition}`}
          role="dialog"
          aria-modal="true"
          aria-label={t.title}
        >
          <header className="relative overflow-hidden bg-[linear-gradient(135deg,#0c3e49_0%,#0f5d67_60%,#167583_100%)] px-5 pb-5 pt-[max(1rem,env(safe-area-inset-top))] text-white sm:pt-5">
            <div className="skipper-hidde-glow absolute -right-10 -top-14 h-40 w-40 rounded-full bg-[#61bbc2]/30 blur-sm" />
            <div className="absolute inset-x-0 bottom-0 h-8 opacity-25" aria-hidden="true">
              <svg viewBox="0 0 420 32" preserveAspectRatio="none" className="h-full w-full">
                <path d="M0 18C70 4 120 30 195 16s135-2 225 2v14H0Z" fill="white" />
              </svg>
            </div>
            <div className="relative flex items-center gap-3">
              <SkipperAvatar large />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold tracking-tight">{t.title}</h2>
                  <Sparkles className="h-4 w-4 text-[#ffd4a8]" aria-hidden="true" />
                </div>
                <p className="mt-0.5 text-xs text-white/78">{t.subtitle}</p>
                <p className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-[#bcebd2]">
                  <span className="h-2 w-2 rounded-full bg-[#63dfa0]" />
                  {t.online}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                aria-label={t.close}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </header>

          <div ref={chatRef} className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-5" aria-live="polite">
            <div className="flex items-end gap-2">
              <SkipperAvatar />
              <p className="max-w-[82%] rounded-2xl rounded-bl-md border border-white bg-white px-4 py-3 text-sm leading-6 text-[#284e54] shadow-[0_8px_24px_rgba(15,75,88,0.08)]">
                {t.welcome}
              </p>
            </div>

            {messages.length === 0 ? (
              <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2">
                {t.quick.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => void submit(item.prompt)}
                    className="flex min-h-14 items-center gap-3 rounded-2xl border border-[#d2e7e5] bg-white px-3.5 py-3 text-left text-xs font-bold leading-5 text-[#0f4b58] shadow-sm transition hover:-translate-y-0.5 hover:border-[#78bdc0] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#7fc2c4] sm:min-h-20 sm:flex-col sm:items-start"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#e8f5f2] text-[#12879a]">
                      <QuickIcon kind={item.kind} />
                    </span>
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}

            {messages.map((message) => {
              const text = message.parts.flatMap((part) => (part.type === 'text' ? part.text : [])).join('')
              if (!text) return null
              const isUser = message.role === 'user'
              return (
                <div key={message.id} className={`flex items-end gap-2 ${isUser ? 'justify-end' : ''}`}>
                  {!isUser ? <SkipperAvatar /> : null}
                  <p
                    className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                      isUser
                        ? 'rounded-br-md bg-[#0f4b58] text-white'
                        : 'rounded-bl-md border border-white bg-white text-[#284e54]'
                    }`}
                  >
                    {text}
                  </p>
                </div>
              )
            })}

            {status === 'submitted' ? (
              <div className="ml-12 flex items-center gap-2 text-xs font-semibold text-[#5b757b]">
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                {t.thinking}
              </div>
            ) : null}

            {error ? (
              <div className="ml-12 rounded-2xl border border-[#f3c9bc] bg-[#fff4ef] p-3 text-xs text-[#8b4436]">
                <p>{t.error}</p>
                <button
                  type="button"
                  onClick={() => {
                    clearError()
                    void regenerate({ body: requestBody })
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 font-bold underline underline-offset-2"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> {t.retry}
                </button>
              </div>
            ) : null}
          </div>

          <footer className="border-t border-[#d2e6e4] bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
            {messages.length > 0 ? (
              <button type="button" onClick={resetConversation} className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#55777b] hover:text-[#0f4b58]">
                <RotateCcw className="h-3.5 w-3.5" /> {t.reset}
              </button>
            ) : null}
            <form onSubmit={onSubmit} className="flex items-end gap-2">
              <label className="sr-only" htmlFor="skipper-hidde-message">{t.placeholder}</label>
              <textarea
                ref={inputRef}
                id="skipper-hidde-message"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                maxLength={2000}
                disabled={busy}
                placeholder={t.placeholder}
                className="max-h-28 min-h-12 flex-1 resize-none rounded-2xl border border-[#c9dfdf] bg-[#f7fbfa] px-4 py-3 text-sm text-[#163c43] outline-none transition placeholder:text-[#78979a] focus:border-[#12879a] focus:ring-2 focus:ring-[#bde4e2] disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#e97559] text-white shadow-[0_8px_20px_rgba(233,117,89,0.28)] transition hover:-translate-y-0.5 hover:bg-[#d9684e] focus:outline-none focus:ring-2 focus:ring-[#f5b5a5] disabled:cursor-not-allowed disabled:opacity-45"
                aria-label={t.send}
              >
                {busy ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </form>
            <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-[#78979a]">
              <LifeBuoy className="h-3 w-3" aria-hidden="true" />
              <span>{t.privacy}</span>
              <a href={privacyUrl} className="font-bold underline underline-offset-2 hover:text-[#0f4b58]">{t.privacyLink}</a>
            </div>
          </footer>
        </section>
      ) : null}
    </>
  )
}
