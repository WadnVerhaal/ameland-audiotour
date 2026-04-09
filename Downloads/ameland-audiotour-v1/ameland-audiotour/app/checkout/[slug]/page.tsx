import { notFound } from 'next/navigation';
import { getTourBySlug } from '@/lib/data/tours';
import { formatEuroFromCents } from '@/lib/utils/money';
import { startCheckout } from './actions';

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour || !tour.is_active) notFound();

  return (
    <main className="mx-auto max-w-md space-y-4 px-4 py-6">
      <div className="rounded-3xl bg-white p-4 shadow-soft">
        <h1 className="text-2xl font-semibold">Snelle checkout</h1>
        <p className="mt-2 text-sm text-stone-600">{tour.title}</p>
        <p className="mt-1 text-lg font-medium">{formatEuroFromCents(tour.price_cents)}</p>
      </div>

      <form action={startCheckout.bind(null, slug)} className="space-y-4 rounded-3xl bg-white p-4 shadow-soft">
        <label className="block space-y-2">
          <span className="text-sm font-medium">E-mailadres</span>
          <input type="email" name="email" required className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none" placeholder="jij@email.nl" />
        </label>
        <button type="submit" className="w-full rounded-2xl bg-stone-900 px-4 py-4 font-medium text-white">
          Betaal en ontvang startlink
        </button>
      </form>
    </main>
  );
}
