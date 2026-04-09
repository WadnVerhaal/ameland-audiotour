export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function requireNonEmpty(value: FormDataEntryValue | null, fieldName: string): string {
  const text = String(value ?? '').trim();
  if (!text) throw new Error(`${fieldName} is verplicht`);
  return text;
}

export function validateEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
  if (!valid) throw new Error('Ongeldig e-mailadres');
  return normalized;
}
