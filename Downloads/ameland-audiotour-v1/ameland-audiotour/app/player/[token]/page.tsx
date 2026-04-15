import { notFound } from 'next/navigation'
import { ExpiredAccessCard } from '@/components/access/expired-access-card'
import { getTourByAccessToken } from '@/lib/data/access'
import { TourPlayer } from '@/components/player/tour-player'
import { getServerLanguage } from '@/lib/app-language-server'

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const data = await getTourByAccessToken(token)
  const language = await getServerLanguage()

  if (data.status === 'expired') {
    return <ExpiredAccessCard language={language} variant="compact" />
  }

  if (data.status === 'invalid') {
    notFound()
  }

  const tour = data.tour

  return (
    <main className="mx-auto max-w-md px-4 py-4">
      <TourPlayer
        token={token}
        stops={data.stops}
        language={language}
        tourId={String(tour?.id ?? token)}
        tourSlug={String(tour?.slug ?? token)}
        tourTitle={String(tour?.title ?? 'Ameland audiotour')}
        customerEmail={typeof data.order?.email === 'string' ? data.order.email : null}
        distanceKm={typeof tour?.distance_km === 'number' ? tour.distance_km : 0}
      />
    </main>
  )
}