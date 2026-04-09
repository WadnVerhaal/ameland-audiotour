import createMollieClient from '@mollie/api-client';

export function mollie() {
  const apiKey = process.env.MOLLIE_API_KEY;
  if (!apiKey) throw new Error('Missing MOLLIE_API_KEY');
  return createMollieClient({ apiKey });
}
