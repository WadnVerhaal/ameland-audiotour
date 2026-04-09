import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTourBySlug } from '@/lib/data/tours';
import { formatEuroFromCents } from '@/lib/utils/money';

export default async function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour || !tour.is_active) notFound();

  return (
    <main className="mx-auto max-w-md space-y-4 px-4 py-6">
      <div className="rounded-3xl bg-white p-4 shadow-soft">
        <h1 className="text-2xl font-semibold">{tour.title}</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">{tour.description}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-600">
          <span className="rounded-full bg-stone-100 px-2 py-1">{tour.duration_minutes} min</span>
          <span className="rounded-full bg-stone-100 px-2 py-1">{tour.distance_km} km</span>
          <span className="rounded-full bg-stone-100 px-2 py-1">{tour.mode}</span>
          <span className="rounded-full bg-stone-100 px-2 py-1">{tour.stops.length} stops</span>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-4 shadow-soft">
        <h2 className="font-semibold">Voorproefje van de route</h2>
        <div className="mt-3 space-y-2">
          {tour.stops.map((stop) => (
            <div key={stop.id} className="rounded-2xl bg-stone-50 p-3 text-sm">
              {stop.order_index}. {stop.title}
            </div>
          ))}
        </div>
      </div>

      <Link href={`/checkout/${tour.slug}`} className="block rounded-2xl bg-stone-900 px-4 py-4 text-center font-medium text-white">
        Koop deze tour voor {formatEuroFromCents(tour.price_cents)}
      </Link>
    </main>
  );
}
