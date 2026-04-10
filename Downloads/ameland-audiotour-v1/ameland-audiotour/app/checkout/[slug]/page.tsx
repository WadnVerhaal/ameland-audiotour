import { notFound } from 'next/navigation';
import { Mail, CreditCard, CheckCircle2 } from 'lucide-react';
import { getTourBySlug } from '@/lib/data/tours';
import { formatEuroFromCents } from '@/lib/utils/money';
import { startCheckout } from './actions';

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour || !tour.is_active) notFound();

  return (
    <main className="mx-auto max-w-md px-4 py-5">
      <section className="rounded-[2rem] border border-app bg-app-card p-5 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Checkout</p>
        <h1 className="mt-3 text-3xl font-bold text-app-accent">Bijna klaar</h1>
        <p className="mt-2 text-sm leading-6 text-app-muted">
          Rond je bestelling af en ontvang direct je startlink per e-mail.
        </p>

        <div className="mt-5 rounded-[1.5rem] bg-white p-4 shadow-card">
          <p className="text-sm font-semibold text-app-accent">{tour.title}</p>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-app-muted">{tour.duration_minutes} min · {tour.distance_km} km</span>
            <span className="text-lg font-semibold text-app-accent">
              {formatEuroFromCents(tour.price_cents)}
            </span>
          </div>
        </div>
      </section>

      <form
        action={startCheckout.bind(null, slug)}
        className="mt-5 rounded-[1.75rem] border border-app bg-app-card p-5 shadow-card"
      >
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium text-app-accent">
            <Mail className="h-4 w-4" />
            E-mailadres
          </span>
          <input
            type="email"
            name="email"
            required
            className="w-full rounded-2xl border border-app bg-white px-4 py-3 text-app outline-none"
            placeholder="jij@email.nl"
          />
        </label>

        <div className="mt-5 space-y-3 rounded-[1.5rem] bg-white p-4 shadow-card">
          <div className="flex items-start gap-3 text-sm text-app-muted">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>Direct na betaling ontvang je een persoonlijke startlink</span>
          </div>
          <div className="flex items-start gap-3 text-sm text-app-muted">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>Je opent de tour eenvoudig op je telefoon</span>
          </div>
          <div className="flex items-start gap-3 text-sm text-app-muted">
            <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>Veilig betalen en daarna meteen op pad</span>
          </div>
        </div>

        <button
          type="submit"
          className="mt-5 w-full rounded-2xl bg-app-accent px-4 py-4 font-medium text-white"
        >
          Betaal en ontvang startlink
        </button>
      </form>
    </main>
  );
}