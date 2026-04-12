import { notFound } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { updateStopAction, deleteStopAction } from './actions';

export default async function AdminStopDetailPage({
  params,
}: {
  params: Promise<{ id: string; stopId: string }>;
}) {
  const { id, stopId } = await params;
  const supabase = createServerSupabase();
  const { data: stop } = await supabase.from('tour_stops').select('*').eq('id', stopId).single();
  if (!stop) notFound();

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <h1 className="text-3xl font-semibold">Stop bewerken</h1>

      <form
        action={updateStopAction.bind(null, id, stopId)}
        className="space-y-4 rounded-3xl bg-white p-4 shadow-soft"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Titel stop (Nederlands)</span>
            <input
              name="title"
              defaultValue={stop.title}
              className="w-full rounded-2xl border px-4 py-3"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Titel stop (Engels)</span>
            <input
              name="title_en"
              defaultValue={stop.title_en ?? ''}
              className="w-full rounded-2xl border px-4 py-3"
            />
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Titel stop (Duits)</span>
          <input
            name="title_de"
            defaultValue={stop.title_de ?? ''}
            className="w-full rounded-2xl border px-4 py-3"
          />
        </label>

        <div className="grid gap-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Korte beschrijving (Nederlands)</span>
            <textarea
              name="short_description"
              defaultValue={stop.short_description ?? ''}
              className="min-h-24 w-full rounded-2xl border px-4 py-3"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Korte beschrijving (Engels)</span>
            <textarea
              name="short_description_en"
              defaultValue={stop.short_description_en ?? ''}
              className="min-h-24 w-full rounded-2xl border px-4 py-3"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Korte beschrijving (Duits)</span>
            <textarea
              name="short_description_de"
              defaultValue={stop.short_description_de ?? ''}
              className="min-h-24 w-full rounded-2xl border px-4 py-3"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Latitude</span>
            <input
              name="lat"
              defaultValue={String(stop.lat ?? '')}
              className="w-full rounded-2xl border px-4 py-3"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Longitude</span>
            <input
              name="lng"
              defaultValue={String(stop.lng ?? '')}
              className="w-full rounded-2xl border px-4 py-3"
              required
            />
          </label>
        </div>

        <div className="grid gap-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Audio URL (oude fallback)</span>
            <input
              name="audio_url"
              defaultValue={stop.audio_url ?? ''}
              className="w-full rounded-2xl border px-4 py-3"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Audio URL Nederlands</span>
            <input
              name="audio_url_nl"
              defaultValue={stop.audio_url_nl ?? ''}
              className="w-full rounded-2xl border px-4 py-3"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Audio URL Engels</span>
            <input
              name="audio_url_en"
              defaultValue={stop.audio_url_en ?? ''}
              className="w-full rounded-2xl border px-4 py-3"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Audio URL Duits</span>
            <input
              name="audio_url_de"
              defaultValue={stop.audio_url_de ?? ''}
              className="w-full rounded-2xl border px-4 py-3"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Afbeelding URL</span>
            <input
              name="image_url"
              defaultValue={stop.image_url ?? ''}
              className="w-full rounded-2xl border px-4 py-3"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Trigger radius (m)</span>
            <input
              type="number"
              name="trigger_radius_meters"
              defaultValue={stop.trigger_radius_meters}
              className="w-full rounded-2xl border px-4 py-3"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Duur audio (sec)</span>
            <input
              type="number"
              name="estimated_duration_seconds"
              defaultValue={stop.estimated_duration_seconds}
              className="w-full rounded-2xl border px-4 py-3"
            />
          </label>
        </div>

        <label className="flex items-center gap-3 rounded-2xl bg-stone-50 px-4 py-3">
          <input type="checkbox" name="is_active" defaultChecked={stop.is_active} />
          <span className="text-sm">Actief</span>
        </label>

        <div className="flex flex-wrap gap-3">
          <button className="rounded-2xl bg-stone-900 px-4 py-3 text-white">Opslaan</button>
          <button
            formAction={deleteStopAction.bind(null, id, stopId)}
            className="rounded-2xl bg-rose-600 px-4 py-3 text-white"
          >
            Verwijderen
          </button>
        </div>
      </form>
    </main>
  );
}