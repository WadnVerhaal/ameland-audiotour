import { mollie } from '@/lib/mollie/client';

export async function createPayment(input: {
  amountCents: number;
  description: string;
  redirectUrl: string;
  webhookUrl: string;
  metadata: Record<string, string>;
}) {
  return mollie().payments.create({
    amount: {
      currency: 'EUR',
      value: (input.amountCents / 100).toFixed(2),
    },
    description: input.description,
    redirectUrl: input.redirectUrl,
    webhookUrl: input.webhookUrl,
    metadata: input.metadata,
  });
}
