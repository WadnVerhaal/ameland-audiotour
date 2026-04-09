type Props = {
  status: 'paid' | 'pending' | 'failed' | 'expired' | 'active' | 'concept';
};

export function StatusBadge({ status }: Props) {
  const map = {
    paid: 'bg-emerald-100 text-emerald-900',
    pending: 'bg-amber-100 text-amber-900',
    failed: 'bg-rose-100 text-rose-900',
    expired: 'bg-stone-200 text-stone-800',
    active: 'bg-emerald-100 text-emerald-900',
    concept: 'bg-stone-200 text-stone-800',
  } as const;

  const labels = {
    paid: 'Betaald',
    pending: 'In afwachting',
    failed: 'Mislukt',
    expired: 'Verlopen',
    active: 'Actief',
    concept: 'Concept',
  } as const;

  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${map[status]}`}>{labels[status]}</span>;
}
