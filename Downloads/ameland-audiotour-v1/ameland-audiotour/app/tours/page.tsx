import { getActiveTours } from '@/lib/data/tours';
import { TourCard } from '@/components/marketing/tour-card';

export default async function ToursPage() {
  const tours = await getActiveTours();

  return (
    <main className="mx-auto max-w-md space-y-4 px-4 py-6">
      <h1 className="text-2xl font-semibold">Kies je tour</h1>
      {tours.map((tour) => <TourCard key={tour.id} tour={tour} />)}
    </main>
  );
}
