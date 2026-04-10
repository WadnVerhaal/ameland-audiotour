import Link from 'next/link';
import { Clock3, MapPin, Bike, Footprints } from 'lucide-react';
import { Tour } from '@/types/tour';
import { formatEuroFromCents } from '@/lib/utils/money';

export function TourCard({ tour }: { tour: Tour }) {
  const modeLabel = tour.mode === 'bike' ? 'Fietstour' : 'Wandeltour';
  const ModeIcon = tour.mode === 'bike' ? Bike : Footprints;

  return (
    <Link
      href={`/tours/${tour.slug}`}
      className="block overflow-hidden rounded-[1.75rem] border border-app bg-app-card shadow-card transition hover:-translate-y-0.5"
    >
      <div className="h-32 w-full bg-[linear-gradient(135deg,#e9dfbf_0%,#f4efe4_45%,#d9e3de_100%)]" />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex rounded-full bg-app-soft px-2.5 py-1 text-[11px] font-semibold text-[#6a5c37]">
              {modeLabel}
            </div>
            <h2 className="mt-3 text-lg font-semibold leading-tight text-app-accent">
              {tour.title}
            </h2>
            <p className="mt-1 text-sm text-app-muted">{tour.subtitle}</p>
          </div>

          <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-app-accent shadow-card">
            {formatEuroFromCents(tour.price_cents)}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-app-muted">
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 shadow-card">
            <Clock3 className="h-3.5 w-3.5" />
            {tour.duration_minutes} min
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 shadow-card">
            <MapPin className="h-3.5 w-3.5" />
            {tour.distance_km} km
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 shadow-card">
            <ModeIcon className="h-3.5 w-3.5" />
            {modeLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}