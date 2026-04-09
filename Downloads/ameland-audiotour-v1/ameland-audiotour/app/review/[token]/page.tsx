import { submitReview } from './actions';

export default async function ReviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  return (
    <main className="mx-auto max-w-md space-y-4 px-4 py-6">
      <div className="rounded-3xl bg-white p-4 shadow-soft">
        <h1 className="text-2xl font-semibold">Hoe vond je de tour?</h1>
        <p className="mt-2 text-sm text-stone-600">Je feedback helpt om de route beter te maken.</p>
      </div>

      <form action={submitReview.bind(null, token)} className="space-y-4 rounded-3xl bg-white p-4 shadow-soft">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Score (1 t/m 5)</span>
          <input type="number" name="rating" min="1" max="5" required className="w-full rounded-2xl border px-4 py-3" />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Opmerking</span>
          <textarea name="review_text" className="min-h-28 w-full rounded-2xl border px-4 py-3" />
        </label>
        <button className="w-full rounded-2xl bg-stone-900 px-4 py-3 text-white">Verstuur review</button>
      </form>
    </main>
  );
}
