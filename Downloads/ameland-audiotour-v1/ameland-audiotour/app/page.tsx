import Link from 'next/link';
import { Headphones, Bike, Clock3, MapPinned, ArrowRight, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-md px-4 py-5">
      <section className="relative overflow-hidden rounded-[2rem] border border-app bg-app-card shadow-soft">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(233,223,191,0.7),transparent_35%)]" />
        <div className="relative p-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-app-soft px-3 py-1 text-xs font-semibold text-[#6a5c37]">
            <Sparkles className="h-3.5 w-3.5" />
            Wad'n Verhaal
          </div>

          <h1 className="mt-4 text-3xl font-bold leading-tight text-app-accent">
            Ontdek Ameland met verhalen op de kaart
          </h1>

          <p className="mt-3 text-sm leading-6 text-app-muted">
            Start een rustige audiotour op je telefoon, volg live waar je bent en loop eenvoudig naar het volgende verhaalpunt.
          </p>

          <div className="mt-5 flex gap-3">
            <Link
              href="/tours"
              className="inline-flex items-center rounded-2xl bg-app-accent px-4 py-3 text-sm font-medium text-white"
            >
              Start een tour
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>

            <Link
              href="/privacy"
              className="inline-flex rounded-2xl border border-app bg-white px-4 py-3 text-sm font-medium text-app-accent"
            >
              Meer info
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white p-4 shadow-card">
              <MapPinned className="h-5 w-5 text-app-accent" />
              <p className="mt-2 text-sm font-semibold text-app-accent">Live kaart</p>
              <p className="mt-1 text-xs leading-5 text-app-muted">
                Zie direct waar je staat en waar je naartoe loopt.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-card">
              <Headphones className="h-5 w-5 text-app-accent" />
              <p className="mt-2 text-sm font-semibold text-app-accent">Audio onderweg</p>
              <p className="mt-1 text-xs leading-5 text-app-muted">
                Verhalen en beleving precies op de juiste plek.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-card">
              <Clock3 className="h-5 w-5 text-app-accent" />
              <p className="mt-2 text-sm font-semibold text-app-accent">Direct starten</p>
              <p className="mt-1 text-xs leading-5 text-app-muted">
                Geen gedoe, gewoon openen en beginnen.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-card">
              <Bike className="h-5 w-5 text-app-accent" />
              <p className="mt-2 text-sm font-semibold text-app-accent">Wandelen of fietsen</p>
              <p className="mt-1 text-xs leading-5 text-app-muted">
                Kies de route die past bij jouw dag op Ameland.
              </p>
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
            <span className="font-semibold text-app-accent">2.</span> Open de tour op je telefoon
          </div>
          <div className="rounded-2xl bg-white p-4">
            <span className="font-semibold text-app-accent">3.</span> Volg live de route en luister onderweg
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