import { getActiveTours } from '@/lib/data/tours';
import { TourCard } from '@/components/marketing/tour-card';
import Link from 'next/link';
import { ArrowLeft, MapPinned } from 'lucide-react';

export default async function ToursPage() {
  const tours = await getActiveTours();

  return (
    <main className="mx-auto max-w-md px-4 py-5">
      <section className="rounded-[2rem] border border-app bg-app-card p-5 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-app-muted transition hover:text-app-accent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug
          </Link>

          <div className="inline-flex shrink-0 items-center gap-2 rounded-full bg-app-soft px-3 py-1 text-xs font-semibold text-[#6a5c37]">
            <MapPinned className="h-3.5 w-3.5" />
            Beschikbare routes
          </div>
        </div>

        <h1 className="mt-6 text-3xl font-bold text-app-accent">Kies je tour</h1>

        <p className="mt-3 max-w-[30ch] text-sm leading-6 text-app-muted">
          Kies de route die past bij jouw dag op Ameland en start eenvoudig op je telefoon.
        </p>
      </section>

      <section className="mt-5 space-y-4">
        {tours.length === 0 ? (
          <div className="rounded-[1.75rem] border border-app bg-app-card p-5 shadow-card">
            <p className="text-sm text-app-muted">Er zijn op dit moment nog geen tours beschikbaar.</p>
          </div>
        ) : (
          tours.map((tour) => (
            <div
              key={tour.id}
              className="rounded-[1.75rem] border border-app bg-app-card p-3 shadow-card"
            >
              <TourCard tour={tour} />
            </div>
          ))
        )}
      </section>
    </main>
  );
}