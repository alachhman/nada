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
  weightLb: number; // realistic shipping weight in lb
  dodgeLine: string; // witty quantified "what you'd be dodging" gag
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  weightLb?: number; // snapshotted from product at add-to-cart time (optional → backward-safe)
}

export interface SaveEntry {
  items: string[]; // product names
  amount: number; // USD intercepted
  timestamp: number;
  itemCount?: number; // total quantity intercepted (optional → backward-safe)
  weightLb?: number; // total weight intercepted in lb (optional → backward-safe)
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
