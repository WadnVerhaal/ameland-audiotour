import Link from 'next/link';
import { Hero } from '@/components/marketing/hero';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-md space-y-4 px-4 py-6">
      <Hero />
      <section className="rounded-3xl bg-white p-4 shadow-soft">
        <h2 className="text-lg font-semibold">Zo werkt het</h2>
        <div className="mt-3 space-y-2 text-sm text-stone-600">
          <div>1. Scan de QR-code</div>
          <div>2. Kies en betaal je tour</div>
          <div>3. Start direct op je telefoon</div>
        </div>
      </section>
      <div className="text-center text-xs text-stone-500">
        <Link href="/privacy" className="underline">Privacy</Link>
        <span className="mx-2">·</span>
        <Link href="/voorwaarden" className="underline">Voorwaarden</Link>
      </div>
    </main>
  );
}
