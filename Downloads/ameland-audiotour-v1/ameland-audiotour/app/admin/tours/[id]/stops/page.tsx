import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStopsAdmin, getTourAdmin } from '@/lib/data/admin';
import { StopForm } from '@/components/admin/stop-form';
import { createStopAction } from './actions';
import { moveStopAction } from './reorder-actions';

export default async function AdminTourStopsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tour = await getTourAdmin(id).catch(() => null);
  if (!tour) notFound();
  const stops = await getStopsAdmin(id);

  return (
    <main className="mx-auto max-w-4xl space-y-4 px-4 py-8">
      <h1 className="text-3xl font-semibold">Stops — {tour.title}</h1>

      <form action={createStopAction.bind(null, id)} className="space-y-4 rounded-3xl bg-white p-4 shadow-soft">
        <StopForm />
      </form>

      <div className="space-y-3">
        {stops.map((stop: any) => (
          <div key={stop.id} className="rounded-3xl bg-white p-4 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{stop.order_index}. {stop.title}</div>
                <div className="mt-1 text-sm text-stone-500">{stop.short_description ?? 'Geen beschrijving'}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={moveStopAction.bind(null, id, stop.id, 'up')}>
                  <button className="rounded-xl bg-stone-100 px-3 py-2 text-sm">Omhoog</button>
                </form>
                <form action={moveStopAction.bind(null, id, stop.id, 'down')}>
                  <button className="rounded-xl bg-stone-100 px-3 py-2 text-sm">Omlaag</button>
                </form>
                <Link href={`/admin/tours/${id}/stops/${stop.id}`} className="rounded-xl bg-stone-900 px-3 py-2 text-sm text-white">Bewerk</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
