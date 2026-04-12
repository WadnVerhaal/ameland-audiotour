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
import { type AppLanguage, translations } from '@/lib/app-language'

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
  language?: AppLanguage
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

const BRAND = {
  border: '#dbecef',
  borderStrong: '#cfe3e5',
  heading: '#0d3d48',
  body: '#143a43',
  muted: '#5b757b',
  accent: '#0f4b58',
  accentAlt: '#12879a',
  coral: '#ef7f63',
  shadow: '0 24px 70px rgba(15,75,88,0.08)',
  shadowStrong: '0 30px 80px rgba(15,75,88,0.20)',
}

const bonusMessages = {
  nl: [
    {
      title: 'Nog één laatste eilandgeheim',
      text: 'De mooiste verhalen van Ameland zitten vaak niet alleen in grote monumenten, maar juist in gewone plekken. Een straat, een uitzicht of een onverwachte bocht vertelt soms meer dan een bord ooit kan doen.',
    },
    {
      title: 'Lokale tip voor na de tour',
      text: 'Neem nog even de tijd om rustig om je heen te kijken of ergens in de buurt iets te drinken. Juist na afloop vallen details vaak pas echt op.',
    },
  ],
  en: [
    {
      title: 'One last island secret',
      text: 'The most beautiful stories of Ameland are often found not only in major monuments, but in ordinary places. A street, a view, or an unexpected turn can tell more than a sign ever could.',
    },
    {
      title: 'A local tip for after the tour',
      text: 'Take a little time to look around or have a drink nearby. Often the details stand out even more once the tour has ended.',
    },
  ],
  de: [
    {
      title: 'Noch ein letztes Inselgeheimnis',
      text: 'Die schönsten Geschichten von Ameland stecken oft nicht nur in großen Denkmälern, sondern gerade in ganz gewöhnlichen Orten. Eine Straße, ein Ausblick oder eine unerwartete Kurve erzählt manchmal mehr als jedes Schild.',
    },
    {
      title: 'Ein lokaler Tipp nach der Tour',
      text: 'Nimm dir noch einen Moment Zeit, dich umzusehen oder irgendwo in der Nähe etwas zu trinken. Gerade nach der Tour fallen Details oft erst richtig auf.',
    },
  ],
} as const

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
    <div
      className="rounded-[1.5rem] border bg-white p-4"
      style={{
        borderColor: BRAND.border,
        boxShadow: '0 12px 35px rgba(18,75,84,0.08)',
      }}
    >
      <div className="mb-2 flex items-center gap-2 text-[#5a8d93]">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">{label}</span>
      </div>
      <div className="text-base font-semibold text-[#143a43]">{value}</div>
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
                ? 'bg-[#eef8f8] text-[#0f4b58]'
                : 'bg-white text-[#7ba5aa] hover:bg-[#f8ffff]'
            }`}
            aria-label={`Rate ${star}`}
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
  language = 'nl',
  onSubmitFeedback,
  onViewNextTour,
  onBackToOverview,
  shareUrl,
}: Props) {
  const t = translations[language]
  const [rating, setRating] = useState(0)
  const [feedbackText, setFeedbackText] = useState('')
  const [recommendation, setRecommendation] = useState<Recommendation>(null)
  const [favoritePart, setFavoritePart] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)

  const bonus = useMemo(() => {
    const items = bonusMessages[language]
    const index = tourSlug.length % items.length
    return items[index]
  }, [tourSlug, language])

  const feedbackPrompt =
    rating >= 4 ? t.completionFeedbackPromptPositive : t.completionFeedbackPromptImprove

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

    const text = t.completionShareText.replace('{tourTitle}', tourTitle)

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
      <div
        className="overflow-hidden rounded-[2.4rem] border bg-white"
        style={{
          borderColor: BRAND.border,
          boxShadow: BRAND.shadow,
        }}
      >
        <div className="relative overflow-hidden border-b px-5 pb-6 pt-6" style={{ borderColor: '#e7f1f2' }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(27,150,165,0.10),transparent_30%),radial-gradient(circle_at_top_right,rgba(239,127,99,0.08),transparent_24%)]" />
          <div className="relative">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#eef8f8] text-[#0f4b58]">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-[#eef8f8] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4f8a8e]">
              <Waves className="h-3.5 w-3.5" />
              {t.completionBadge}
            </div>

            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[#143a43]">
              {t.completionTitle}
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#5b757b]">
              {t.completionIntro.replace('{tourTitle}', tourTitle)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 px-5 py-5">
          <StatCard
            icon={<Map className="h-4 w-4 text-[#12879a]" />}
            label={t.completionStopsLabel}
            value={`${stopsCompleted}/${stopsTotal} ${t.completionStopsValue}`}
          />
          <StatCard
            icon={<Route className="h-4 w-4 text-[#12879a]" />}
            label={t.distance}
            value={`${distanceKm.toFixed(1)} km`}
          />
          <StatCard
            icon={<Clock3 className="h-4 w-4 text-[#12879a]" />}
            label={t.completionDurationLabel}
            value={`${durationMinutes} min`}
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4 text-[#12879a]" />}
            label={t.completionFinishedLabel}
            value={completedAtLabel}
          />
        </div>

        <div className="px-5 pb-5">
          <div
            className="rounded-[1.6rem] border p-4"
            style={{
              borderColor: '#d7ecea',
              background: '#f8ffff',
            }}
          >
            <div className="mb-2 flex items-center gap-2 text-[#12879a]">
              <Gift className="h-5 w-5" />
              <h2 className="text-sm font-semibold text-[#143a43]">{bonus.title}</h2>
            </div>
            <p className="text-sm leading-6 text-[#5b757b]">{bonus.text}</p>
          </div>
        </div>

        <div className="border-t px-5 py-5" style={{ borderColor: '#e7f1f2' }}>
          <div className="mb-4 flex items-center gap-2 text-[#143a43]">
            <MessageSquareText className="h-5 w-5 text-[#12879a]" />
            <h2 className="text-lg font-semibold">{t.completionExperienceTitle}</h2>
          </div>

          {!isSubmitted ? (
            <>
              <StarRating value={rating} onChange={setRating} />

              {rating > 0 && (
                <>
                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-medium text-[#143a43]">
                      {feedbackPrompt}
                    </label>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      rows={4}
                      className="w-full rounded-2xl border bg-white px-4 py-3 text-sm text-[#143a43] outline-none transition"
                      style={{ borderColor: BRAND.borderStrong }}
                      placeholder={
                        rating >= 4
                          ? t.completionFeedbackPlaceholderPositive
                          : t.completionFeedbackPlaceholderImprove
                      }
                    />
                  </div>

                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-medium text-[#143a43]">
                      {t.completionFavoriteLabel}
                    </label>
                    <input
                      value={favoritePart}
                      onChange={(e) => setFavoritePart(e.target.value)}
                      className="w-full rounded-2xl border bg-white px-4 py-3 text-sm text-[#143a43] outline-none transition"
                      style={{ borderColor: BRAND.borderStrong }}
                      placeholder={t.completionFavoritePlaceholder}
                    />
                  </div>

                  <div className="mt-5">
                    <p className="mb-2 text-sm font-medium text-[#143a43]">
                      {t.completionRecommendLabel}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: t.recommendYes, value: 'yes' as const },
                        { label: t.recommendMaybe, value: 'maybe' as const },
                        { label: t.recommendNo, value: 'no' as const },
                      ].map((option) => {
                        const active = recommendation === option.value
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setRecommendation(option.value)}
                            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                              active
                                ? 'text-white'
                                : 'bg-white text-[#0f4b58] hover:bg-[#f8ffff]'
                            }`}
                            style={{
                              background: active ? BRAND.accent : '#ffffff',
                              borderColor: active ? BRAND.accent : BRAND.borderStrong,
                            }}
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
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      background: BRAND.accent,
                      boxShadow: '0 16px 38px rgba(15,75,88,0.20)',
                    }}
                  >
                    {isSubmitting ? t.completionSubmitting : t.completionSubmit}
                  </button>
                </>
              )}
            </>
          ) : (
            <div
              className="rounded-2xl border p-4 text-sm"
              style={{
                borderColor: '#d7ecea',
                background: '#eef8f8',
                color: '#0f4b58',
              }}
            >
              {t.completionSubmitted}
            </div>
          )}
        </div>

        <div className="border-t px-5 py-5" style={{ borderColor: '#e7f1f2' }}>
          <div className="grid gap-3 md:grid-cols-2">
            <div
              className="rounded-[1.5rem] border bg-white p-4"
              style={{
                borderColor: BRAND.border,
                boxShadow: '0 12px 35px rgba(18,75,84,0.08)',
              }}
            >
              <div className="mb-2 flex items-center gap-2 text-[#143a43]">
                <BadgeCheck className="h-5 w-5 text-[#12879a]" />
                <h3 className="text-sm font-semibold">{t.completionBadgeCardTitle}</h3>
              </div>
              <p className="text-base font-semibold text-[#143a43]">
                {t.completionBadgeCardName}
              </p>
              <p className="mt-1 text-sm leading-6 text-[#5b757b]">
                {t.completionBadgeCardText}
              </p>
            </div>

            <div
              className="rounded-[1.5rem] border bg-white p-4"
              style={{
                borderColor: BRAND.border,
                boxShadow: '0 12px 35px rgba(18,75,84,0.08)',
              }}
            >
              <div className="mb-2 flex items-center gap-2 text-[#143a43]">
                <Share2 className="h-5 w-5 text-[#12879a]" />
                <h3 className="text-sm font-semibold">{t.completionShareTitle}</h3>
              </div>
              <p className="mb-3 text-sm leading-6 text-[#5b757b]">
                {t.completionShareBody}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 rounded-2xl border bg-white px-4 py-2.5 text-sm font-semibold text-[#0f4b58] transition hover:bg-[#f8ffff]"
                  style={{ borderColor: BRAND.borderStrong }}
                >
                  <Share2 className="h-4 w-4" />
                  {t.completionShareButton}
                </button>
                {shareUrl ? (
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-2 rounded-2xl border bg-white px-4 py-2.5 text-sm font-semibold text-[#0f4b58] transition hover:bg-[#f8ffff]"
                    style={{ borderColor: BRAND.borderStrong }}
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? t.completionCopied : t.completionCopy}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t px-5 py-5" style={{ borderColor: '#e7f1f2' }}>
          <div
            className="relative overflow-hidden rounded-[2rem] p-5 text-white"
            style={{ boxShadow: BRAND.shadowStrong }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.10),transparent_30%),linear-gradient(135deg,#0f4b58_0%,#0d3f4d_58%,#0a3340_100%)]" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9cd4d1]">
                {t.completionMoreLabel}
              </p>
              <h2 className="mt-2 text-xl font-semibold">{t.completionMoreTitle}</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#d3ebea]">
                {t.completionMoreText}
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onViewNextTour}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#0f4b58] transition hover:bg-[#f3ffff]"
                >
                  {t.completionNextTourButton}
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={onBackToOverview}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40"
                >
                  {t.completionBackButton}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}