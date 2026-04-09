export type Review = {
  id: string;
  tour_id: string;
  order_id: string | null;
  rating: number;
  review_text: string | null;
  created_at: string;
};
