import Link from 'next/link';
import { getAllToursAdmin } from '@/lib/data/admin';
import { StatusBadge } from '@/components/ui/status-badge';

export default async function AdminToursPage() {
  const tours = await getAllToursAdmin();

  return (
    <main className="mx-auto max-w-4xl space-y-4 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Tours</h1>
        <Link href="/admin/tours/new" className="rounded-2xl bg-stone-900 px-4 py-3 text-white">Nieuwe tour</Link>
      </div>
      <div className="space-y-3">
        {tours.map((tour: any) => (
          <Link key={tour.id} href={`/admin/tours/${tour.id}`} className="block rounded-3xl bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold">{tour.title}</div>
                <div className="text-sm text-stone-500">{tour.slug}</div>
              </div>
              <StatusBadge status={tour.is_active ? 'active' : 'concept'} />
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
