'use client';

export function StopForm() {
  return (
    <>
      <label className="block space-y-2">
        <span className="text-sm font-medium">Titel stop</span>
        <input name="title" className="w-full rounded-2xl border px-4 py-3" required />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-medium">Korte beschrijving</span>
        <textarea name="short_description" className="min-h-24 w-full rounded-2xl border px-4 py-3" />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Latitude</span>
          <input name="lat" className="w-full rounded-2xl border px-4 py-3" required />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Longitude</span>
          <input name="lng" className="w-full rounded-2xl border px-4 py-3" required />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Audio URL</span>
          <input name="audio_url" className="w-full rounded-2xl border px-4 py-3" />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Afbeelding URL</span>
          <input name="image_url" className="w-full rounded-2xl border px-4 py-3" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Trigger radius (m)</span>
          <input type="number" name="trigger_radius_meters" defaultValue="70" className="w-full rounded-2xl border px-4 py-3" />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Duur audio (sec)</span>
          <input type="number" name="estimated_duration_seconds" defaultValue="180" className="w-full rounded-2xl border px-4 py-3" />
        </label>
      </div>
      <button className="rounded-2xl bg-stone-900 px-4 py-3 text-white">Stop opslaan</button>
    </>
  );
}
