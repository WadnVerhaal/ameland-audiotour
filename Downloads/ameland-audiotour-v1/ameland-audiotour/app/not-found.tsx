import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md space-y-4 px-4 py-10">
      <div className="rounded-3xl bg-white p-6 text-center shadow-soft">
        <h1 className="text-2xl font-semibold">Pagina niet gevonden</h1>
        <p className="mt-2 text-sm text-stone-600">Deze pagina bestaat niet of is niet meer beschikbaar.</p>
        <Link href="/" className="mt-5 inline-flex rounded-2xl bg-stone-900 px-4 py-3 font-medium text-white">
          Terug naar home
        </Link>
      </div>
    </main>
  );
}
