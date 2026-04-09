import Link from 'next/link';
import { Tour } from '@/types/tour';
import { formatEuroFromCents } from '@/lib/utils/money';

export function TourCard({ tour }: { tour: Tour }) {
  return (
    <Link href={`/tours/${tour.slug}`} className="block rounded-3xl bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{tour.title}</h2>
          <p className="mt-1 text-sm text-stone-500">{tour.subtitle}</p>
        </div>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-medium">
          {formatEuroFromCents(tour.price_cents)}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-600">
        <span className="rounded-full bg-stone-100 px-2 py-1">{tour.duration_minutes} min</span>
        <span className="rounded-full bg-stone-100 px-2 py-1">{tour.distance_km} km</span>
        <span className="rounded-full bg-stone-100 px-2 py-1">{tour.mode}</span>
      </div>
    </Link>
  );
}
