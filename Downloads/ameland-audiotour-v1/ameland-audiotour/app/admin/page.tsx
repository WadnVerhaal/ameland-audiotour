import Link from 'next/link';

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <h1 className="text-3xl font-semibold">Admin</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/tours" className="rounded-3xl bg-white p-5 shadow-soft">Tours beheren</Link>
        <Link href="/admin/orders" className="rounded-3xl bg-white p-5 shadow-soft">Bestellingen</Link>
        <Link href="/admin/reviews" className="rounded-3xl bg-white p-5 shadow-soft">Reviews</Link>
        <Link href="/admin/partners" className="rounded-3xl bg-white p-5 shadow-soft">Partners</Link>
      </div>
    </main>
  );
}
