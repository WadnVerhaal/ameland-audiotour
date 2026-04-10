import { getActiveTours } from '@/lib/data/tours';
import { TourCard } from '@/components/marketing/tour-card';

export default async function ToursPage() {
  const tours = await getActiveTours();

  return (
    <main className="mx-auto max-w-md px-4 py-5">
      <section className="rounded-[2rem] border border-app bg-app-card p-5 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Tours</p>
        <h1 className="mt-3 text-3xl font-bold text-app-accent">Kies je tour</h1>
        <p className="mt-2 text-sm leading-6 text-app-muted">
          Kies de route die past bij jouw dag op Ameland.
        </p>
      </section>

      <section className="mt-5 space-y-4">
        {tours.map((tour) => (
          <div
            key={tour.id}
            className="rounded-[1.75rem] border border-app bg-app-card p-3 shadow-card"
          >
            <TourCard tour={tour} />
          </div>
        ))}
      </section>
    </main>
  );
}