'use client'

import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  Star,
  Map,
  Clock3,
  Route,
  Gift,
  Share2,
  Copy,
  ArrowRight,
  BadgeCheck,
  MessageSquareText,
  Waves,
} from 'lucide-react'

type Recommendation = 'yes' | 'maybe' | 'no' | null

type Props = {
  tourId: string
  tourSlug: string
  tourTitle: string
  completedAtLabel: string
  stopsCompleted: number
  stopsTotal: number
  durationMinutes: number
  distanceKm: number
  onSubmitFeedback: (payload: {
    rating: number
    feedbackText: string
    recommendation: Recommendation
    favoritePart: string
  }) => Promise<void>
  onViewNextTour?: () => void
  onBackToOverview?: () => void
  shareUrl?: string
}

const bonusMessages = [
  {
    title: 'Nog één laatste eilandgeheim',
    text: 'De mooiste verhalen van Ameland zitten vaak niet alleen in grote monumenten, maar juist in gewone plekken. Een straat, een uitzicht of een onverwachte bocht vertelt soms meer dan een bord ooit kan doen.',
  },
  {
    title: 'Lokale tip voor na de tour',
    text: 'Neem nog even de tijd om rustig om je heen te kijken of ergens in de buurt iets te drinken. Juist na afloop vallen details vaak pas echt op.',
  },
]

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-card">
      <div className="mb-2 flex items-center gap-2 text-app-muted">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">{label}</span>
      </div>
      <div className="text-base font-semibold text-app-accent">{value}</div>
    </div>
  )
}

function StarRating({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`rounded-full p-2 transition ${
              active
                ? 'bg-app-soft text-[#a56a4d]'
                : 'bg-white text-[#b8afa1] hover:bg-[#f3ecdd]'
            }`}
            aria-label={`Geef ${star} ster${star > 1 ? 'ren' : ''}`}
          >
            <Star className={`h-6 w-6 ${active ? 'fill-current' : ''}`} />
          </button>
        )
      })}
    </div>
  )
}

export default function TourCompletionScreen({
  tourSlug,
  tourTitle,
  completedAtLabel,
  stopsCompleted,
  stopsTotal,
  durationMinutes,
  distanceKm,
  onSubmitFeedback,
  onViewNextTour,
  onBackToOverview,
  shareUrl,
}: Props) {
  const [rating, setRating] = useState(0)
  const [feedbackText, setFeedbackText] = useState('')
  const [recommendation, setRecommendation] = useState<Recommendation>(null)
  const [favoritePart, setFavoritePart] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)

  const bonus = useMemo(() => {
    const index = tourSlug.length % bonusMessages.length
    return bonusMessages[index]
  }, [tourSlug])

  const feedbackPrompt =
    rating >= 4 ? 'Wat vond je het mooiste aan deze tour?' : 'Wat kunnen we verbeteren?'

  async function handleSubmit() {
    if (!rating || isSubmitting) return

    try {
      setIsSubmitting(true)
      await onSubmitFeedback({
        rating,
        feedbackText,
        recommendation,
        favoritePart,
      })
      setIsSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCopyLink() {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  async function handleShare() {
    if (!shareUrl) return

    const text = `Ik heb net de audiotour "${tourTitle}" op Ameland afgerond. Echt een mooie manier om het eiland te beleven.`

    if (navigator.share) {
      await navigator.share({
        title: tourTitle,
        text,
        url: shareUrl,
      })
      return
    }

    await handleCopyLink()
  }

  return (
    <section className="mx-auto w-full max-w-2xl px-4 pb-24 pt-6">
      <div className="overflow-hidden rounded-[2rem] border border-app bg-app-card shadow-soft">
        <div className="relative overflow-hidden border-b border-app px-5 pb-6 pt-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(233,223,191,0.75),transparent_38%)]" />
          <div className="relative">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#edf5ef] text-app-accent">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-app-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6a5c37]">
              <Waves className="h-3.5 w-3.5" />
              Tour voltooid
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-app-accent">
              Bedankt dat je met ons op pad ging
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-app-muted">
              We hopen dat je {tourTitle} onderweg nét iets anders hebt leren zien. Neem gerust
              nog even de tijd om om je heen te kijken. Audiofragmenten kun je later altijd
              opnieuw beluisteren, pauzeren en terugspoelen op een veilig moment.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 px-5 py-5">
          <StatCard
            icon={<Map className="h-4 w-4 text-app-accent" />}
            label="Stops"
            value={`${stopsCompleted}/${stopsTotal} bezocht`}
          />
          <StatCard
            icon={<Route className="h-4 w-4 text-app-accent" />}
            label="Afstand"
            value={`${distanceKm.toFixed(1)} km`}
          />
          <StatCard
            icon={<Clock3 className="h-4 w-4 text-app-accent" />}
            label="Duur"
            value={`${durationMinutes} min`}
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4 text-app-accent" />}
            label="Afgerond"
            value={completedAtLabel}
          />
        </div>

        <div className="px-5 pb-5">
          <div className="rounded-[1.5rem] border border-[#eadfbe] bg-[#fbf6e8] p-4">
            <div className="mb-2 flex items-center gap-2 text-[#8a6a2e]">
              <Gift className="h-5 w-5" />
              <h2 className="text-sm font-semibold">{bonus.title}</h2>
            </div>
            <p className="text-sm leading-6 text-app-muted">{bonus.text}</p>
          </div>
        </div>

        <div className="border-t border-app px-5 py-5">
          <div className="mb-4 flex items-center gap-2 text-app-accent">
            <MessageSquareText className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Hoe heb je deze tour ervaren?</h2>
          </div>

          {!isSubmitted ? (
            <>
              <StarRating value={rating} onChange={setRating} />

              {rating > 0 && (
                <>
                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-medium text-app-accent">
                      {feedbackPrompt}
                    </label>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      rows={4}
                      className="w-full rounded-2xl border border-app bg-white px-4 py-3 text-sm text-app outline-none transition focus:border-[#9f9076]"
                      placeholder={
                        rating >= 4
                          ? 'Bijvoorbeeld: de sfeer, de verhalen, de plekken of de route.'
                          : 'Bijvoorbeeld: de route, de audio, de uitleg of het gebruiksgemak.'
                      }
                    />
                  </div>

                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-medium text-app-accent">
                      Welk onderdeel sprong er voor jou uit?
                    </label>
                    <input
                      value={favoritePart}
                      onChange={(e) => setFavoritePart(e.target.value)}
                      className="w-full rounded-2xl border border-app bg-white px-4 py-3 text-sm text-app outline-none transition focus:border-[#9f9076]"
                      placeholder="Bijvoorbeeld: een specifieke stop, het audioverhaal of het landschap."
                    />
                  </div>

                  <div className="mt-5">
                    <p className="mb-2 text-sm font-medium text-app-accent">
                      Zou je deze tour aanraden aan anderen?
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Ja, zeker', value: 'yes' as const },
                        { label: 'Misschien', value: 'maybe' as const },
                        { label: 'Nee', value: 'no' as const },
                      ].map((option) => {
                        const active = recommendation === option.value
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setRecommendation(option.value)}
                            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                              active
                                ? 'border-transparent bg-app-accent text-white'
                                : 'border-app bg-white text-app-accent hover:bg-app-soft'
                            }`}
                          >
                            {option.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!rating || isSubmitting}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-app-accent px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? 'Bezig met opslaan...' : 'Verstuur beoordeling'}
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-[#d9eadf] bg-[#edf7f0] p-4 text-sm text-[#2f5a49]">
              Dank je wel. Je beoordeling is opgeslagen.
            </div>
          )}
        </div>

        <div className="border-t border-app px-5 py-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[1.5rem] bg-white p-4 shadow-card">
              <div className="mb-2 flex items-center gap-2 text-app-accent">
                <BadgeCheck className="h-5 w-5" />
                <h3 className="text-sm font-semibold">Badge vrijgespeeld</h3>
              </div>
              <p className="text-base font-semibold text-app-accent">Ameland Ontdekker</p>
              <p className="mt-1 text-sm leading-6 text-app-muted">
                Toegekend voor het voltooien van deze route.
              </p>
            </div>

            <div className="rounded-[1.5rem] bg-white p-4 shadow-card">
              <div className="mb-2 flex items-center gap-2 text-app-accent">
                <Share2 className="h-5 w-5" />
                <h3 className="text-sm font-semibold">Deel jouw Ameland-moment</h3>
              </div>
              <p className="mb-3 text-sm leading-6 text-app-muted">
                Ken je iemand die dit ook mooi zou vinden? Deel de tour eenvoudig.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 rounded-2xl border border-app bg-white px-4 py-2.5 text-sm font-semibold text-app-accent transition hover:bg-app-soft"
                >
                  <Share2 className="h-4 w-4" />
                  Delen
                </button>
                {shareUrl ? (
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-2 rounded-2xl border border-app bg-white px-4 py-2.5 text-sm font-semibold text-app-accent transition hover:bg-app-soft"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? 'Gekopieerd' : 'Kopieer link'}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-app px-5 py-5">
          <div className="rounded-[1.75rem] bg-app-accent p-5 text-white shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              Zin in meer?
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              Ontdek nog een andere route op Ameland
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
              Beleef het eiland opnieuw, met een ander verhaal, een andere sfeer en nieuwe
              plekken.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onViewNextTour}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-app-accent transition hover:bg-[#f7f3ea]"
              >
                Bekijk volgende tour
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={onBackToOverview}
                className="inline-flex items-center justify-center rounded-2xl border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/45"
              >
                Terug naar overzicht
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}