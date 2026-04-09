import Link from 'next/link';

export function Hero() {
  return (
    <section className="rounded-3xl bg-stone-950 p-6 text-white shadow-soft">
      <p className="mb-3 text-sm text-stone-300">Ontdek. Luister. Beleef.</p>
      <h1 className="text-3xl font-semibold leading-tight">Ontdek Ameland met verhalen in je oor.</h1>
      <p className="mt-3 text-sm leading-6 text-stone-300">
        Een simpele mobiele audiotour die automatisch start op de juiste plek.
      </p>
      <div className="mt-5 flex flex-wrap gap-3 text-xs text-stone-300">
        <span className="rounded-full bg-white/10 px-3 py-1">± 75 min</span>
        <span className="rounded-full bg-white/10 px-3 py-1">Fietstour</span>
        <span className="rounded-full bg-white/10 px-3 py-1">€ 9,99</span>
      </div>
      <Link href="/tours" className="mt-5 inline-flex rounded-2xl bg-white px-4 py-3 font-medium text-stone-900">
        Bekijk tours
      </Link>
    </section>
  );
}
