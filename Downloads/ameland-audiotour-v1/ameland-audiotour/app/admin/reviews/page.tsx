import { getReviewsAdmin } from '@/lib/data/admin';

export default async function AdminReviewsPage() {
  const reviews = await getReviewsAdmin();

  return (
    <main className="mx-auto max-w-4xl space-y-4 px-4 py-8">
      <h1 className="text-3xl font-semibold">Reviews</h1>
      <div className="space-y-3">
        {reviews.map((review: any) => (
          <div key={review.id} className="rounded-3xl bg-white p-4 shadow-soft">
            <div className="font-semibold">{review.tours?.title ?? 'Tour'}</div>
            <div className="mt-1 text-sm text-stone-500">Score: {review.rating}/5</div>
            <p className="mt-3 text-sm text-stone-700">{review.review_text || 'Geen tekst'}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
