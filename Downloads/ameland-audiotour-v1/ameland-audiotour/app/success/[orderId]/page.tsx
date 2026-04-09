import Link from 'next/link';
import { getSuccessState } from './actions';

export default async function SuccessPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const state = await getSuccessState(orderId);

  if (state.status !== 'paid') {
    return (
      <main className="mx-auto max-w-md space-y-4 px-4 py-6">
        <div className="rounded-3xl bg-white p-4 shadow-soft">
          <h1 className="text-2xl font-semibold">We controleren je betaling</h1>
          <p className="mt-2 text-sm text-stone-600">
            Je betaling is nog niet bevestigd. Ververs deze pagina over een paar seconden.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md space-y-4 px-4 py-6">
      <div className="rounded-3xl bg-white p-4 shadow-soft">
        <h1 className="text-2xl font-semibold">Je tour staat klaar</h1>
        <p className="mt-2 text-sm text-stone-600">Je startlink is verstuurd. Je kunt hieronder ook direct openen.</p>
      </div>
      <Link href={state.accessUrl!} className="block rounded-2xl bg-stone-900 px-4 py-4 text-center font-medium text-white">
        Open mijn tour nu
      </Link>
    </main>
  );
}
