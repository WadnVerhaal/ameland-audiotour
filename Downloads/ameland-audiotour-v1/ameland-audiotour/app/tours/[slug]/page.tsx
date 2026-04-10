import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock3, MapPin, Headphones, Check } from 'lucide-react';
import { getTourBySlug } from '@/lib/data/tours';
import { formatEuroFromCents } from '@/lib/utils/money';

export default async function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour || !tour.is_active) notFound();

  return (
    <main className="mx-auto max-w-md px-4 py-5">
      <section className="overflow-hidden rounded-[2rem] border border-app bg-app-card shadow-soft">
        <div className="relative">
          <div className="h-56 w-full bg-[linear-gradient(135deg,#e9dfbf_0%,#f4efe4_45%,#d9e3de_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f8f4eb] to-transparent" />
        </div>

        <div className="p-5">
          <div className="inline-flex rounded-full bg-app-soft px-3 py-1 text-xs font-semibold text-[#6a5c37]">
            {tour.mode === 'bike' ? 'Fietstour' : 'Wandeltour'}
          </div>

          <h1 className="mt-4 text-3xl font-bold leading-tight text-app-accent">
            {tour.title}
          </h1>

          <p className="mt-3 text-sm leading-6 text-app-muted">{tour.description}</p>

          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-white p-3 shadow-card">
              <div className="flex items-center gap-2 text-app-accent">
                <Clock3 className="h-4 w-4" />
                <span className="font-medium">{tour.duration_minutes} min</span>
              </div>
            </div>
            <div className="rounded-2xl bg-white p-3 shadow-card">
              <div className="flex items-center gap-2 text-app-accent">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">{tour.distance_km} km</span>
              </div>
            </div>
            <div className="rounded-2xl bg-white p-3 shadow-card">
              <div className="flex items-center gap-2 text-app-accent">
                <Headphones className="h-4 w-4" />
                <span className="font-medium">{tour.stops.length} stops</span>
              </div>
            </div>
            <div className="rounded-2xl bg-white p-3 shadow-card">
              <div className="font-medium text-app-accent">{formatEuroFromCents(tour.price_cents)}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-[1.75rem] border border-app bg-app-card p-5 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
          Wat je kunt verwachten
        </p>

        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3 text-sm text-app-muted">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>Ontdek Ameland op je eigen tempo</span>
          </div>
          <div className="flex items-start gap-3 text-sm text-app-muted">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>Luister onderweg naar verhalen op bijzondere plekken</span>
          </div>
          <div className="flex items-start gap-3 text-sm text-app-muted">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>Direct te starten op je telefoon na aankoop</span>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-[1.75rem] border border-app bg-app-card p-5 shadow-card">
        <h2 className="text-lg font-semibold text-app-accent">Voorproefje van de route</h2>
        <div className="mt-4 space-y-3">
          {tour.stops.map((stop) => (
            <div key={stop.id} className="rounded-2xl bg-white p-4 text-sm shadow-card">
              <span className="font-semibold text-app-accent">{stop.order_index}.</span>{' '}
              <span className="text-app">{stop.title}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-5 space-y-3">
        <Link
          href={`/checkout/${tour.slug}`}
          className="block rounded-2xl bg-app-accent px-4 py-4 text-center font-medium text-white"
        >
          Bestel deze tour voor {formatEuroFromCents(tour.price_cents)}
        </Link>

        <Link
          href="/tours"
          className="block rounded-2xl border border-app bg-white px-4 py-4 text-center font-medium text-app-accent"
        >
          Terug naar alle tours
        </Link>
      </div>
    </main>
  );
}