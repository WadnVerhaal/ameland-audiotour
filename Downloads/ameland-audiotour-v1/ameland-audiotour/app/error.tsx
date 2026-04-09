'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-md space-y-4 px-4 py-10">
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold">Er ging iets mis</h1>
        <p className="mt-2 text-sm text-stone-600">
          Probeer het opnieuw. Blijft het probleem bestaan, controleer dan de instellingen of probeer het later.
        </p>
        <p className="mt-3 text-xs text-stone-400">{error.message}</p>
        <button
          onClick={() => reset()}
          className="mt-5 rounded-2xl bg-stone-900 px-4 py-3 text-white"
        >
          Opnieuw proberen
        </button>
      </div>
    </main>
  );
}