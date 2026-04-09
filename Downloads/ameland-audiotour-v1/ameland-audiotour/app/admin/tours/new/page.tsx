import { TourForm } from '@/components/admin/tour-form';
import { createTourAction } from './actions';

export default function AdminTourNewPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-3xl font-semibold">Nieuwe tour</h1>
      <form action={createTourAction} className="space-y-4 rounded-3xl bg-white p-4 shadow-soft">
        <TourForm submitLabel="Tour aanmaken" />
      </form>
    </main>
  );
}
