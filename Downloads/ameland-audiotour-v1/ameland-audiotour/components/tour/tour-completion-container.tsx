'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import TourCompletionScreen from '@/components/tour/tour-completion-screen'
import { saveTourCompletion, saveTourFeedback } from '@/app/tours/[slug]/completion-actions'
import { type AppLanguage } from '@/lib/app-language'

type Props = {
  tourId: string
  tourSlug: string
  tourTitle: string
  email?: string | null
  stopsTotal: number
  stopsCompleted: number
  durationSeconds: number
  distanceKm: number
  language?: AppLanguage
}

export default function TourCompletionContainer({
  tourId,
  tourSlug,
  tourTitle,
  email,
  stopsTotal,
  stopsCompleted,
  durationSeconds,
  distanceKm,
  language = 'nl',
}: Props) {
  const router = useRouter()
  const [completionId, setCompletionId] = useState<string | null>(null)

  const completedAtLabel = useMemo(() => {
    return new Intl.DateTimeFormat(
      language === 'de' ? 'de-DE' : language === 'en' ? 'en-GB' : 'nl-NL',
      {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
    ).format(new Date())
  }, [language])

  async function ensureCompletionId() {
    if (completionId) return completionId

    const result = await saveTourCompletion({
      tourId,
      tourSlug,
      email: email ?? null,
      durationSeconds,
      distanceKm,
      stopsTotal,
      stopsCompleted,
    })

    setCompletionId(result.id)
    return result.id
  }

  async function handleSubmitFeedback(payload: {
    rating: number
    feedbackText: string
    recommendation: 'yes' | 'maybe' | 'no' | null
    favoritePart: string
  }) {
    const id = await ensureCompletionId()

    await saveTourFeedback({
      tourId,
      completionId: id,
      rating: payload.rating,
      feedbackText: payload.feedbackText,
      recommendation: payload.recommendation,
      favoritePart: payload.favoritePart,
    })
  }

  return (
    <TourCompletionScreen
      tourId={tourId}
      tourSlug={tourSlug}
      tourTitle={tourTitle}
      completedAtLabel={completedAtLabel}
      stopsCompleted={stopsCompleted}
      stopsTotal={stopsTotal}
      durationMinutes={Math.max(1, Math.round(durationSeconds / 60))}
      distanceKm={distanceKm}
      shareUrl={typeof window !== 'undefined' ? window.location.href : undefined}
      language={language}
      onSubmitFeedback={handleSubmitFeedback}
      onViewNextTour={() => router.push('/tours')}
      onBackToOverview={() => router.push('/tours')}
    />
  )
}