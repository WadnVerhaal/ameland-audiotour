import Link from 'next/link';
import { CheckCircle2, Headphones, MapPinned } from 'lucide-react';

export default async function SuccessPage({ params }: { params: Promise<{ orderId: string }> }) {
  await params;

  return (
    <main className="mx-auto max-w-md px-4 py-5">
      <section className="overflow-hidden rounded-[2rem] border border-app bg-app-card shadow-soft">
        <div className="h-32 w-full bg-[linear-gradient(135deg,#e9dfbf_0%,#f4efe4_45%,#d9e3de_100%)]" />
        <div className="p-5">
          <div className="inline-flex rounded-full bg-app-soft px-3 py-1 text-xs font-semibold text-[#6a5c37]">
            Je bestelling is gelukt
          </div>

          <h1 className="mt-4 text-3xl font-bold leading-tight text-app-accent">
            Je tour staat klaar
          </h1>

          <p className="mt-3 text-sm leading-6 text-app-muted">
            Je startlink is verstuurd per e-mail. Open je mailbox om direct te beginnen.
          </p>
        </div>
      </section>

      <section className="mt-5 rounded-[1.75rem] border border-app bg-app-card p-5 shadow-card">
        <div className="space-y-3">
          <div className="flex items-start gap-3 text-sm text-app-muted">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>Je bestelling is succesvol afgerond</span>
          </div>
          <div className="flex items-start gap-3 text-sm text-app-muted">
            <Headphones className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>Je ontvangt je persoonlijke toegang per e-mail</span>
          </div>
          <div className="flex items-start gap-3 text-sm text-app-muted">
            <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-app-accent" />
            <span>Start wanneer jij er klaar voor bent op Ameland</span>
          </div>
        </div>
      </section>

      <div className="mt-5 space-y-3">
        <Link
          href="/tours"
          className="block rounded-2xl bg-app-accent px-4 py-4 text-center font-medium text-white"
        >
          Bekijk tours
        </Link>

        <Link
          href="/"
          className="block rounded-2xl border border-app bg-white px-4 py-4 text-center font-medium text-app-accent"
        >
          Terug naar home
        </Link>
      </div>
    </main>
  );
}