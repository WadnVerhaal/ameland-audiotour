'use client';

type Props = {
  defaultValues?: {
    title?: string;
    slug?: string;
    subtitle?: string;
    description?: string;
    language?: string;
    mode?: string;
    duration_minutes?: number;
    distance_km?: number;
    price?: string;
    is_active?: boolean;
  };
  submitLabel?: string;
};

export function TourForm({ defaultValues, submitLabel = 'Opslaan' }: Props) {
  return (
    <>
      <label className="block space-y-2">
        <span className="text-sm font-medium">Titel</span>
        <input name="title" defaultValue={defaultValues?.title ?? ''} className="w-full rounded-2xl border px-4 py-3" required />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-medium">Slug</span>
        <input name="slug" defaultValue={defaultValues?.slug ?? ''} className="w-full rounded-2xl border px-4 py-3" />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-medium">Subtitel</span>
        <input name="subtitle" defaultValue={defaultValues?.subtitle ?? ''} className="w-full rounded-2xl border px-4 py-3" />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-medium">Beschrijving</span>
        <textarea name="description" defaultValue={defaultValues?.description ?? ''} className="min-h-28 w-full rounded-2xl border px-4 py-3" required />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Taal</span>
          <input name="language" defaultValue={defaultValues?.language ?? 'nl'} className="w-full rounded-2xl border px-4 py-3" />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Mode</span>
          <input name="mode" defaultValue={defaultValues?.mode ?? 'fiets'} className="w-full rounded-2xl border px-4 py-3" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Duur (min)</span>
          <input type="number" name="duration_minutes" defaultValue={defaultValues?.duration_minutes ?? 75} className="w-full rounded-2xl border px-4 py-3" />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Afstand (km)</span>
          <input type="number" step="0.1" name="distance_km" defaultValue={defaultValues?.distance_km ?? 14} className="w-full rounded-2xl border px-4 py-3" />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Prijs</span>
          <input name="price" defaultValue={defaultValues?.price ?? '9.99'} className="w-full rounded-2xl border px-4 py-3" />
        </label>
      </div>
      <label className="flex items-center gap-3 rounded-2xl bg-stone-50 px-4 py-3">
        <input type="checkbox" name="is_active" defaultChecked={defaultValues?.is_active ?? false} />
        <span className="text-sm">Actief zetten</span>
      </label>
      <button className="rounded-2xl bg-stone-900 px-4 py-3 text-white">{submitLabel}</button>
    </>
  );
}
