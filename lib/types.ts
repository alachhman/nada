export interface Review {
  author: string;
  rating: number; // 1-5
  text: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string; // URL
  rating: number; // average, 1-5
  reviewCount: number;
  reviews: Review[];
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
}

export interface SaveEntry {
  items: string[]; // product names
  amount: number; // USD intercepted
  timestamp: number;
}

export interface NadaState {
  totalSaved: number;
  interceptCount: number;
  streak: number;
  lastActiveDate: string | null; // YYYY-MM-DD
  saves: SaveEntry[];
}

export const INITIAL_STATE: NadaState = {
  totalSaved: 0,
  interceptCount: 0,
  streak: 0,
  lastActiveDate: null,
  saves: [],
};
