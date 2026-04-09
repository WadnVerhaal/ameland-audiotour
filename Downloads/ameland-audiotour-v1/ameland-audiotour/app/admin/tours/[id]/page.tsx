import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTourAdmin } from '@/lib/data/admin';
import { TourForm } from '@/components/admin/tour-form';
import { updateTourAction } from './actions';

export default async function AdminTourDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tour = await getTourAdmin(id).catch(() => null);
  if (!tour) notFound();

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Tour bewerken</h1>
        <Link href={`/admin/tours/${id}/stops`} className="rounded-2xl bg-stone-100 px-4 py-3 text-stone-900">Stops beheren</Link>
      </div>
      <form action={updateTourAction.bind(null, id)} className="space-y-4 rounded-3xl bg-white p-4 shadow-soft">
        <TourForm
          submitLabel="Wijzigingen opslaan"
          defaultValues={{
            title: tour.title,
            slug: tour.slug,
            subtitle: tour.subtitle ?? '',
            description: tour.description,
            language: tour.language,
            mode: tour.mode,
            duration_minutes: tour.duration_minutes,
            distance_km: Number(tour.distance_km),
            price: (tour.price_cents / 100).toFixed(2),
            is_active: tour.is_active,
          }}
        />
      </form>
    </main>
  );
}
