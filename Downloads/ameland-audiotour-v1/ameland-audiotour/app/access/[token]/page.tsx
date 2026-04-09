import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTourByAccessToken } from '@/lib/data/access';

export default async function AccessPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getTourByAccessToken(token);
  if (!data) notFound();

  return (
    <main className="mx-auto max-w-md space-y-4 px-4 py-6">
      <div className="rounded-3xl bg-white p-4 shadow-soft">
        <h1 className="text-2xl font-semibold">{data.tour.title}</h1>
        <p className="mt-2 text-sm text-stone-600">
          We gebruiken je locatie alleen om het volgende verhaal op het juiste moment te starten.
        </p>
      </div>
      <Link href={`/player/${token}`} className="block rounded-2xl bg-stone-900 px-4 py-4 text-center font-medium text-white">
        Start tour
      </Link>
    </main>
  );
}
