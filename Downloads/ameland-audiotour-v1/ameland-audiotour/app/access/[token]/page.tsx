import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CheckCircle2, Clock3, MapPin, Headphones } from 'lucide-react';
import { getTourByAccessToken } from '@/lib/data/access';

function getTourImage(slug: string) {
  if (slug.includes('verborgen-verhalen')) return '/images/tour-dorp.jpg';
  if (slug.includes('fiets')) return '/images/tour-fietsen.jpg';
  return '/images/tour-duinen.jpg';
}

export default async function AccessPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getTourByAccessToken(token);

  if (!data || !data.tour) notFound();

  const { tour, stops } = data;

  return (
    <main className="mx-auto max-w-md px-4 py-5">
      <section className="overflow-hidden rounded-[2rem] border border-app bg-app-card shadow-soft">
        <div className="relative h-48 w-full">
          <Image
            src={getTourImage(tour.slug)}
            alt={tour.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f8f4eb] via-[#f8f4eb]/35 to-transparent" />
        </div>

        <div className="p-5">
          <div className="inline-flex rounded-full bg-app-soft px-3 py-1 text-xs font-semibold text-[#6a5c37]">
            Toegang actief
          </div>

          <h1 className="mt-4 text-3xl font-bold leading-tight text-app-accent">
            {tour.title}
          </h1>

          <p className="mt-3 text-sm leading-6 text-app-muted">
            Je tour staat klaar. We gebruiken je locatie alleen om het volgende verhaal op het juiste moment te starten.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
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
                <span className="font-medium">{stops.length} stops</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-[1.75rem] border border-app bg-app-card p-5 shadow-card">
        <div className="space-y-3">
          <div className="flex items-start gap-3 text-sm text-app-muted">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>Je kunt direct starten op je telefoon</span>
          </div>
          <div className="flex items-start gap-3 text-sm text-app-muted">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>Audio speelt automatisch af op de juiste plekken</span>
          </div>
          <div className="flex items-start gap-3 text-sm text-app-muted">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>Je kunt ook handmatig naar de volgende stop gaan</span>
          </div>
        </div>
      </section>

      <div className="mt-5 space-y-3">
        <Link
          href={`/player/${token}`}
          className="block rounded-2xl bg-app-accent px-4 py-4 text-center font-medium text-white"
        >
          Start tour
        </Link>

        <div className="rounded-[1.75rem] border border-app bg-app-card p-5 shadow-card">
          <h2 className="text-lg font-semibold text-app-accent">Voorproefje van de route</h2>
          <div className="mt-4 space-y-3">
            {stops.slice(0, 3).map((stop) => (
              <div key={stop.id} className="rounded-2xl bg-white p-4 text-sm shadow-card">
                <span className="font-semibold text-app-accent">{stop.order_index}.</span>{' '}
                <span className="text-app">{stop.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}