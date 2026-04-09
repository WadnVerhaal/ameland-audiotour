import { getOrdersAdmin } from '@/lib/data/admin';
import { StatusBadge } from '@/components/ui/status-badge';

export default async function AdminOrdersPage() {
  const orders = await getOrdersAdmin();

  return (
    <main className="mx-auto max-w-5xl space-y-4 px-4 py-8">
      <h1 className="text-3xl font-semibold">Bestellingen</h1>
      <div className="overflow-hidden rounded-3xl bg-white shadow-soft">
        <table className="min-w-full text-sm">
          <thead className="bg-stone-100 text-left">
            <tr>
              <th className="px-4 py-3">Tour</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Bedrag</th>
              <th className="px-4 py-3">Partner</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order: any) => (
              <tr key={order.id} className="border-t border-stone-100">
                <td className="px-4 py-3">{order.tours?.title ?? '-'}</td>
                <td className="px-4 py-3">{order.email}</td>
                <td className="px-4 py-3"><StatusBadge status={order.payment_status} /></td>
                <td className="px-4 py-3">€ {(order.amount_cents / 100).toFixed(2)}</td>
                <td className="px-4 py-3">{order.partners?.name ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
