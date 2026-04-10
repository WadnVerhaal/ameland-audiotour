import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Headphones, MapPinned } from 'lucide-react';
import { getTourByAccessToken } from '@/lib/data/access';
import { TourPlayer } from '@/components/player/tour-player';

export default async function PlayerPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getTourByAccessToken(token);
  if (!data) notFound();

  return (
    <main className="mx-auto max-w-md px-4 py-5">
      <section className="mb-5 overflow-hidden rounded-[2rem] border border-app bg-app-card shadow-soft">
        <div className="relative h-48 w-full">
          <Image
            src="/images/tour-dorp.jpg"
            alt="Tour op Ameland"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f8f4eb] via-[#f8f4eb]/30 to-transparent" />
        </div>

        <div className="p-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-app-soft px-3 py-1 text-xs font-semibold text-[#6a5c37]">
            <Headphones className="h-3.5 w-3.5" />
            Je tour staat klaar
          </div>

          <h1 className="mt-4 text-3xl font-bold leading-tight text-app-accent">
            Volg de route en luister onderweg
          </h1>

          <p className="mt-3 text-sm leading-6 text-app-muted">
            Je ziet live waar je bent, waar de volgende stop is en wanneer het volgende verhaal begint.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-medium text-app-accent shadow-card">
            <MapPinned className="h-3.5 w-3.5" />
            Live navigatie actief tijdens je tour
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-app bg-app-card p-4 shadow-card">
        <TourPlayer token={token} stops={data.stops} />
      </section>
    </main>
  );
}
