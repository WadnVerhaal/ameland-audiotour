export function formatEuroFromCents(amountCents: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(amountCents / 100);
}

export function parseEuroInputToCents(value: string): number {
  const normalized = value.replace(',', '.').trim();
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error('Ongeldige prijs');
  }
  return Math.round(amount * 100);
}
