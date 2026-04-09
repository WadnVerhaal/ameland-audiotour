export type OrderStatus = 'pending' | 'paid' | 'failed' | 'expired';

export type Order = {
  id: string;
  tour_id: string;
  email: string;
  partner_id: string | null;
  payment_status: OrderStatus;
  payment_provider: string;
  payment_reference: string | null;
  amount_cents: number;
  created_at: string;
};
