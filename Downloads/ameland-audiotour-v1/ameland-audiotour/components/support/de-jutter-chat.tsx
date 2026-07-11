'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import {
  Headphones,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Send,
  ShoppingBag,
  Sparkles,
  Waves,
  X,
} from 'lucide-react'
import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react'

type Language = 'nl' | 'en' | 'de'

type DeJutterChatProps = {
  apiEndpoint?: string
  privacyUrl?: string
}

const copy = {
  nl: {
    open: 'Hulp nodig?',
    title: 'De Jutter',
    subtitle: 'Jouw digitale eilandhulp',
    close: 'Chat sluiten',
    welcome:
      'Hoi! Ik ben De Jutter. Ik help je met je bestelling, toegang en alles onderweg. Waar loop je tegenaan?',
    placeholder: 'Typ je vraag…',
    send: 'Versturen',
    thinking: 'De Jutter zoekt het voor je uit…',
    error: 'Dat bericht bereikte de overkant niet. Probeer het nog eens.',
    privacy: 'De Jutter gebruikt AI. Deel geen betaalgegevens of wachtwoorden.',
    privacyLink: 'Privacy',
    quick: [
      {
        label: 'Mijn startlink ontbreekt',
        prompt: 'Ik heb betaald, maar ik kan mijn persoonlijke startlink niet vinden.',
        kind: 'order',
      },
      {
        label: 'Locatie werkt niet',
        prompt: 'Mijn locatie werkt niet tijdens de tour. Kun je me helpen?',
        kind: 'location',
      },
      {
        label: 'Ik hoor geen audio',
        prompt: 'Ik hoor geen audio in de tour. Kun je me helpen dit op te lossen?',
        kind: 'audio',
      },
    ],
  },
  en: {
    open: 'Need help?',
    title: 'De Jutter',
    subtitle: 'Your digital island guide',
    close: 'Close chat',
    welcome:
      "Hi! I'm De Jutter. I can help with your order, access and anything along the way. What can I sort out for you?",
    placeholder: 'Type your question…',
    send: 'Send',
    thinking: 'De Jutter is looking into it…',
    error: 'That message did not make it across. Please try again.',
    privacy: 'De Jutter uses AI. Never share payment details or passwords.',
    privacyLink: 'Privacy',
    quick: [
      {
        label: 'My start link is missing',
        prompt: 'I paid, but I cannot find my personal start link.',
        kind: 'order',
      },
      {
        label: 'Location is not working',
        prompt: 'My location is not working during the tour. Can you help?',
        kind: 'location',
      },
      {
        label: 'I cannot hear audio',
        prompt: 'I cannot hear audio in the tour. Can you help me fix it?',
        kind: 'audio',
      },
    ],
  },
  de: {
    open: 'Hilfe nötig?',
    title: 'De Jutter',
    subtitle: 'Deine digitale Inselhilfe',
    close: 'Chat schließen',
    welcome:
      'Moin! Ich bin De Jutter. Ich helfe dir bei Bestellung, Zugang und allem unterwegs. Was kann ich für dich lösen?',
    placeholder: 'Schreib deine Frage…',
    send: 'Senden',
    thinking: 'De Jutter klärt das für dich…',
    error: 'Die Nachricht ist nicht angekommen. Bitte versuche es noch einmal.',
    privacy: 'De Jutter nutzt KI. Teile keine Zahlungsdaten oder Passwörter.',
    privacyLink: 'Datenschutz',
    quick: [
      {
        label: 'Mein Startlink fehlt',
        prompt: 'Ich habe bezahlt, finde aber meinen persönlichen Startlink nicht.',
        kind: 'order',
      },
      {
        label: 'Standort funktioniert nicht',
        prompt: 'Mein Standort funktioniert während der Tour nicht. Kannst du mir helfen?',
        kind: 'location',
      },
      {
        label: 'Ich höre keinen Ton',
        prompt: 'Ich höre in der Tour keinen Ton. Kannst du mir helfen?',
        kind: 'audio',
      },
    ],
  },
} as const

function detectLanguage(): Language {
  const pathLanguage = window.location.pathname.split('/')[1]
  if (pathLanguage === 'nl' || pathLanguage === 'en' || pathLanguage === 'de') return pathLanguage

  const queryLanguage = new URLSearchParams(window.location.search).get('lang')
  if (queryLanguage === 'nl' || queryLanguage === 'en' || queryLanguage === 'de') {
    return queryLanguage
  }

  const languageCookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith('wadnverhaal-language=') || entry.startsWith('locale='))
    ?.split('=')[1]
  if (languageCookie === 'nl' || languageCookie === 'en' || languageCookie === 'de') {
    return languageCookie
  }

  return navigator.language.toLowerCase().startsWith('de')
    ? 'de'
    : navigator.language.toLowerCase().startsWith('en')
      ? 'en'
      : 'nl'
}

function QuickIcon({ kind }: { kind: string }) {
  if (kind === 'location') return <MapPin className="h-4 w-4" aria-hidden="true" />
  if (kind === 'audio') return <Headphones className="h-4 w-4" aria-hidden="true" />
  return <ShoppingBag className="h-4 w-4" aria-hidden="true" />
}

export function DeJutterChat({
  apiEndpoint = '/api/support/chat',
  privacyUrl = '/privacy',
}: DeJutterChatProps) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [language] = useState<Language>(() =>
    typeof window === 'undefined' ? 'nl' : detectLanguage()
  )
  const inputRef = useRef<HTMLInputElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const transport = useMemo(() => new DefaultChatTransport({ api: apiEndpoint }), [apiEndpoint])
  const { messages, sendMessage, status, error } = useChat({ transport })
  const t = copy[language]
  const busy = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])

  useEffect(() => {
    if (open) {
      chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, open, status])

  async function submit(text: string) {
    const message = text.trim().slice(0, 2000)
    if (!message || busy) return
    setInput('')
    await sendMessage(
      { text: message },
      { body: { locale: language, context: { pathname: window.location.pathname } } }
    )
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void submit(input)
  }

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-[70] inline-flex items-center gap-2 rounded-full border border-white/70 bg-[#0f4b58] px-4 py-3 text-sm font-bold text-white shadow-[0_18px_45px_rgba(15,75,88,0.34)] transition hover:-translate-y-0.5 hover:bg-[#0b404b] focus:outline-none focus:ring-4 focus:ring-[#9bdad8] sm:right-6"
          aria-label={`${t.open} — ${t.title}`}
        >
          <span className="relative grid h-8 w-8 place-items-center rounded-full bg-[#f2dfb9] text-[#0f4b58]">
            <Waves className="h-5 w-5" aria-hidden="true" />
            <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 text-[#ef7f63]" aria-hidden="true" />
          </span>
          {t.open}
        </button>
      ) : null}

      {open ? (
        <section
          className="fixed inset-0 z-[80] flex flex-col overflow-hidden bg-[#f4fbfa] shadow-2xl sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(680px,calc(100vh-3rem))] sm:w-[410px] sm:rounded-[2rem] sm:border sm:border-[#cfe3e5]"
          role="dialog"
          aria-modal="true"
          aria-label={t.title}
        >
          <header className="relative overflow-hidden bg-[#0f4b58] px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] text-white sm:pt-4">
            <div className="absolute -right-8 -top-12 h-36 w-36 rounded-full bg-[#12879a]/45" />
            <div className="relative flex items-center gap-3">
              <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f2dfb9] text-[#0f4b58] shadow-lg">
                <Waves className="h-7 w-7" aria-hidden="true" />
                <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-[#ff9a7f]" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">{t.title}</h2>
                  <span className="h-2 w-2 rounded-full bg-[#71e0b1]" title="Online" />
                </div>
                <p className="text-xs text-white/75">{t.subtitle}</p>
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

          <div ref={chatRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-5" aria-live="polite">
            <div className="flex items-end gap-2">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e9d8ad] text-[#0f4b58]">
                <Waves className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="max-w-[84%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm leading-6 text-[#284e54] shadow-[0_8px_24px_rgba(15,75,88,0.08)]">
                {t.welcome}
              </p>
            </div>

            {messages.length === 0 ? (
              <div className="grid gap-2 pt-2">
                {t.quick.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => void submit(item.prompt)}
                    className="flex items-center gap-3 rounded-2xl border border-[#d7e9e9] bg-white px-4 py-3 text-left text-sm font-semibold text-[#0f4b58] transition hover:border-[#7fc2c4] hover:bg-[#f9ffff] focus:outline-none focus:ring-2 focus:ring-[#7fc2c4]"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#eaf7f6] text-[#12879a]">
                      <QuickIcon kind={item.kind} />
                    </span>
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}

            {messages.map((message) => {
              const text = message.parts
                .flatMap((part) => (part.type === 'text' ? part.text : []))
                .join('')
              if (!text) return null
              const isUser = message.role === 'user'
              return (
                <div key={message.id} className={`flex items-end gap-2 ${isUser ? 'justify-end' : ''}`}>
                  {!isUser ? (
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e9d8ad] text-[#0f4b58]">
                      <Waves className="h-4 w-4" aria-hidden="true" />
                    </span>
                  ) : null}
                  <p
                    className={`max-w-[84%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                      isUser
                        ? 'rounded-br-md bg-[#0f4b58] text-white'
                        : 'rounded-bl-md bg-white text-[#284e54]'
                    }`}
                  >
                    {text}
                  </p>
                </div>
              )
            })}

            {status === 'submitted' ? (
              <div className="flex items-center gap-2 text-xs font-medium text-[#5b757b]">
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                {t.thinking}
              </div>
            ) : null}
            {error ? (
              <p className="rounded-xl bg-[#fff1ed] px-3 py-2 text-xs text-[#9c4938]">{t.error}</p>
            ) : null}
          </div>

          <footer className="border-t border-[#dbecef] bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
            <form onSubmit={onSubmit} className="flex items-end gap-2">
              <label className="sr-only" htmlFor="de-jutter-message">{t.placeholder}</label>
              <input
                ref={inputRef}
                id="de-jutter-message"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                maxLength={2000}
                disabled={busy}
                placeholder={t.placeholder}
                autoComplete="off"
                className="min-h-11 flex-1 rounded-2xl border border-[#cfe3e5] bg-[#f8fcfc] px-4 py-3 text-sm text-[#163c43] outline-none transition placeholder:text-[#78979a] focus:border-[#12879a] focus:ring-2 focus:ring-[#bde4e2] disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#ef7f63] text-white transition hover:bg-[#df6f55] focus:outline-none focus:ring-2 focus:ring-[#f5b5a5] disabled:cursor-not-allowed disabled:opacity-45"
                aria-label={t.send}
              >
                {busy ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </form>
            <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-[#78979a]">
              <MessageCircle className="h-3 w-3" aria-hidden="true" />
              <span>{t.privacy}</span>
              <a href={privacyUrl} className="font-semibold underline hover:text-[#0f4b58]">{t.privacyLink}</a>
            </div>
          </footer>
        </section>
      ) : null}
    </>
  )
}
