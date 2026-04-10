import Link from 'next/link';
import Image from 'next/image';
import { Bike, Headphones, Clock3 } from 'lucide-react';

export function Hero() {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-app bg-app-card shadow-soft">
      <div className="relative h-56 w-full">
        <Image
          src="/images/hero-ameland.jpg"
          alt="Fietsen en wandelen op Ameland"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8f4eb] via-[#f8f4eb]/55 to-transparent" />
      </div>

      <div className="relative p-6">
        <div className="inline-flex rounded-full bg-app-soft px-3 py-1 text-xs font-semibold text-[#6a5c37]">
          Audiotours op Ameland
        </div>

        <h1 className="mt-4 text-3xl font-bold leading-tight text-app-accent">
          Ontdek Ameland met verhalen onderweg
        </h1>

        <p className="mt-3 text-sm leading-6 text-app-muted">
          Kies een route voor wandelen of fietsen en beleef dorp, duin en eilandverhalen op je eigen tempo.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white p-3 shadow-card">
            <Clock3 className="h-4 w-4 text-app-accent" />
            <p className="mt-2 text-xs font-semibold text-app">± 75 min</p>
          </div>
          <div className="rounded-2xl bg-white p-3 shadow-card">
            <Bike className="h-4 w-4 text-app-accent" />
            <p className="mt-2 text-xs font-semibold text-app">Wandelen & fietsen</p>
          </div>
          <div className="rounded-2xl bg-white p-3 shadow-card">
            <Headphones className="h-4 w-4 text-app-accent" />
            <p className="mt-2 text-xs font-semibold text-app">Direct starten</p>
          </div>
        </div>

        <Link
          href="/tours"
          className="mt-5 inline-flex rounded-2xl bg-app-accent px-4 py-3 font-medium text-white"
        >
          Bekijk tours
        </Link>
      </div>
    </section>
  );
}