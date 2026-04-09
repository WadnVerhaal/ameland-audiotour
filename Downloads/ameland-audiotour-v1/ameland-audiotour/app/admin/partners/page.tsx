import { getPartnersAdmin } from '@/lib/data/admin';
import { createPartnerAction } from './actions';

export default async function AdminPartnersPage() {
  const partners = await getPartnersAdmin();

  return (
    <main className="mx-auto max-w-4xl space-y-4 px-4 py-8">
      <h1 className="text-3xl font-semibold">Partners</h1>

      <form action={createPartnerAction} className="space-y-4 rounded-3xl bg-white p-4 shadow-soft">
        <h2 className="text-lg font-semibold">Nieuwe partner</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <input name="name" placeholder="Naam" className="rounded-2xl border px-4 py-3" required />
          <input name="partner_type" placeholder="Type" className="rounded-2xl border px-4 py-3" required />
          <input name="qr_slug" placeholder="qr-slug" className="rounded-2xl border px-4 py-3" />
        </div>
        <button className="rounded-2xl bg-stone-900 px-4 py-3 text-white">Partner toevoegen</button>
      </form>

      <div className="space-y-3">
        {partners.map((partner: any) => (
          <div key={partner.id} className="rounded-3xl bg-white p-4 shadow-soft">
            <div className="font-semibold">{partner.name}</div>
            <div className="mt-1 text-sm text-stone-500">{partner.partner_type} · {partner.qr_slug}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
