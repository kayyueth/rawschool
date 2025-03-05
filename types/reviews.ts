export interface BookReview {
  id: number;
  book_id: number;
  reviewer: string;
  review: string;
  created_at: string;
}

export interface BookclubReview {
  id: string;
  user_id: string;
  wallet_address: string;
  title: string;
  content: string;
  book_id?: number;
  created_at: string;
  updated_at: string;
}
