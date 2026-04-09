export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h1 className="text-3xl font-semibold">Privacy</h1>
        <p className="mt-4 text-sm leading-6 text-stone-600">
          Deze app verwerkt alleen gegevens die nodig zijn om de audiotour te leveren, zoals je e-mailadres,
          betaalstatus en beperkte gebruiksgegevens voor verbetering van de dienst.
        </p>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Locatie wordt alleen gebruikt tijdens de tour om het juiste audiofragment op het juiste moment te starten.
        </p>
      </div>
    </main>
  );
}
