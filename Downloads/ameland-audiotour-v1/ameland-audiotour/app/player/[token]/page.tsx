import { notFound } from 'next/navigation'
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
  if (!data) notFound()

  const language = await getServerLanguage()
  const resolvedData = data as any
  const tour = resolvedData?.tour ?? resolvedData

  return (
    <main className="mx-auto max-w-md px-4 py-4">
      <TourPlayer
        token={token}
        stops={data.stops}
        language={language}
        tourId={String(tour?.id ?? token)}
        tourSlug={String(tour?.slug ?? token)}
        tourTitle={String(tour?.title ?? 'Ameland audiotour')}
        customerEmail={typeof resolvedData?.email === 'string' ? resolvedData.email : null}
        distanceKm={typeof tour?.distance_km === 'number' ? tour.distance_km : 0}
      />
    </main>
  )
}