export type TourCompletionInsert = {
  tour_id: string;
  tour_slug: string;
  email?: string | null;
  duration_seconds?: number | null;
  distance_km?: number | null;
  stops_total?: number | null;
  stops_completed?: number | null;
};

export type TourFeedbackInsert = {
  tour_id: string;
  completion_id?: string | null;
  rating: number;
  feedback_text?: string | null;
  recommendation?: 'yes' | 'maybe' | 'no' | null;
  favorite_part?: string | null;
};