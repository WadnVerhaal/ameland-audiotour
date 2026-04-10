import Link from 'next/link';
import { Headphones, Bike, Clock3 } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-md px-4 py-5">
      <section className="relative overflow-hidden rounded-[2rem] border border-app bg-app-card shadow-soft">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(233,223,191,0.6),transparent_35%)]" />
        <div className="relative p-6">
          <div className="inline-flex rounded-full bg-app-soft px-3 py-1 text-xs font-semibold text-[#6a5c37]">
            Audiotours op Ameland
          </div>

          <h1 className="mt-4 text-3xl font-bold leading-tight text-app-accent">
            Ontdek Ameland op jouw tempo
          </h1>

          <p className="mt-3 text-sm leading-6 text-app-muted">
            Rustige audiotours voor wandelen en fietsen. Kies jouw route en start eenvoudig op je telefoon.
          </p>

          <div className="mt-5 flex gap-3">
            <Link
              href="/tours"
              className="inline-flex rounded-2xl bg-app-accent px-4 py-3 text-sm font-medium text-white"
            >
              Bekijk tours
            </Link>
            <Link
              href="/privacy"
              className="inline-flex rounded-2xl border border-app bg-white px-4 py-3 text-sm font-medium text-app-accent"
            >
              Meer info
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white p-3 shadow-card">
              <Clock3 className="h-4 w-4 text-app-accent" />
              <p className="mt-2 text-xs font-semibold">Direct starten</p>
            </div>
            <div className="rounded-2xl bg-white p-3 shadow-card">
              <Headphones className="h-4 w-4 text-app-accent" />
              <p className="mt-2 text-xs font-semibold">Verhalen onderweg</p>
            </div>
            <div className="rounded-2xl bg-white p-3 shadow-card">
              <Bike className="h-4 w-4 text-app-accent" />
              <p className="mt-2 text-xs font-semibold">Wandelen of fietsen</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-[1.75rem] border border-app bg-app-card p-5 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Zo werkt het</p>
        <div className="mt-4 space-y-3 text-sm text-app-muted">
          <div className="rounded-2xl bg-white p-4">
            <span className="font-semibold text-app-accent">1.</span> Kies jouw tour
          </div>
          <div className="rounded-2xl bg-white p-4">
            <span className="font-semibold text-app-accent">2.</span> Rond je bestelling af
          </div>
          <div className="rounded-2xl bg-white p-4">
            <span className="font-semibold text-app-accent">3.</span> Start direct op je telefoon
          </div>
        </div>
      </section>

      <div className="mt-5 text-center text-xs text-app-muted">
        <Link href="/privacy" className="underline">
          Privacy
        </Link>
        <span className="mx-2">·</span>
        <Link href="/voorwaarden" className="underline">
          Voorwaarden
        </Link>
      </div>
    </main>
  );
}