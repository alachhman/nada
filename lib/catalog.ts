import type { Product } from "@/lib/types";

function img(id: string) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=70`;
}

export const CATALOG: Product[] = [
  { id: "retro-runner", name: "Retro Runner Sneakers", category: "Apparel", price: 129, image: img("photo-1542291026-7eec264c27ff"), rating: 5, reviewCount: 2481, reviews: [{ author: "Jess M.", rating: 5, text: "Obsessed. Wear them daily." }, { author: "Devon", rating: 4, text: "Run a half size small but gorgeous." }] },
  { id: "linen-hoodie", name: "Heavyweight Hoodie", category: "Apparel", price: 74, image: img("photo-1556821840-3a63f95609a7"), rating: 5, reviewCount: 932, reviews: [{ author: "Sam P.", rating: 5, text: "Softest thing I own." }] },
  { id: "arc-lamp", name: "Arc Table Lamp", category: "Home", price: 58, image: img("photo-1507473885765-e6ed057f782c"), rating: 4, reviewCount: 410, reviews: [{ author: "Lena", rating: 4, text: "Warm light, looks pricey." }] },
  { id: "ceramic-mug", name: "Stoneware Mug Set", category: "Home", price: 22, image: img("photo-1514228742587-6b1558fcca3d"), rating: 5, reviewCount: 1203, reviews: [{ author: "Tomas", rating: 5, text: "Perfect weight, keeps heat." }] },
  { id: "noise-buds", name: "Wireless Earbuds Pro", category: "Tech", price: 149, image: img("photo-1606220588913-b3aacb4d2f46"), rating: 4, reviewCount: 5621, reviews: [{ author: "Priya", rating: 5, text: "ANC is shockingly good." }] },
  { id: "mech-keyboard", name: "Compact Mechanical Keyboard", category: "Tech", price: 99, image: img("photo-1587829741301-dc798b83add3"), rating: 5, reviewCount: 870, reviews: [{ author: "Q", rating: 5, text: "Thocky. No regrets." }] },
  { id: "cast-skillet", name: "Cast Iron Skillet", category: "Kitchen", price: 39, image: img("photo-1593618998160-e34014e67546"), rating: 5, reviewCount: 3110, reviews: [{ author: "Marie", rating: 5, text: "Sears like a dream." }] },
  { id: "pour-over", name: "Pour-Over Coffee Set", category: "Kitchen", price: 45, image: img("photo-1495474472287-4d71bcdd2085"), rating: 4, reviewCount: 660, reviews: [{ author: "Ade", rating: 4, text: "Morning ritual upgrade." }] },
  { id: "yoga-mat", name: "Cork Yoga Mat", category: "Fitness", price: 68, image: img("photo-1592432678016-e910b452f9a2"), rating: 5, reviewCount: 540, reviews: [{ author: "Nina", rating: 5, text: "Zero slip, smells amazing." }] },
  { id: "dumbbell-set", name: "Adjustable Dumbbells", category: "Fitness", price: 189, image: img("photo-1517836357463-d25dfeac3438"), rating: 4, reviewCount: 1290, reviews: [{ author: "Carl", rating: 4, text: "Saves so much space." }] },
  { id: "leather-tote", name: "Everyday Leather Tote", category: "Apparel", price: 158, image: img("photo-1591561954557-26941169b49e"), rating: 5, reviewCount: 720, reviews: [{ author: "Bea", rating: 5, text: "Goes with everything." }] },
  { id: "sunnies", name: "Polarized Sunglasses", category: "Apparel", price: 95, image: img("photo-1511499767150-a48a237f0083"), rating: 4, reviewCount: 980, reviews: [{ author: "Ravi", rating: 4, text: "Look way more expensive." }] },
  { id: "desk-plant", name: "Potted Monstera", category: "Home", price: 34, image: img("photo-1614594975525-e45190c55d0b"), rating: 5, reviewCount: 305, reviews: [{ author: "Jo", rating: 5, text: "Arrived huge and healthy." }] },
  { id: "throw-blanket", name: "Chunky Knit Throw", category: "Home", price: 64, image: img("photo-1580301762395-83604792a36c"), rating: 5, reviewCount: 1450, reviews: [{ author: "Mira", rating: 5, text: "Couch is now a trap." }] },
  { id: "smart-watch", name: "Fitness Smartwatch", category: "Tech", price: 199, image: img("photo-1523275335684-37898b6baf30"), rating: 4, reviewCount: 8800, reviews: [{ author: "Dee", rating: 4, text: "Battery lasts a week." }] },
  { id: "instant-cam", name: "Instant Camera", category: "Tech", price: 79, image: img("photo-1496181133206-80ce9b88a853"), rating: 5, reviewCount: 410, reviews: [{ author: "Lou", rating: 5, text: "So fun at parties." }] },
  { id: "chef-knife", name: "8-inch Chef's Knife", category: "Kitchen", price: 89, image: img("photo-1593618998160-e34014e67546"), rating: 5, reviewCount: 2010, reviews: [{ author: "Hugo", rating: 5, text: "Scary sharp out of the box." }] },
  { id: "blender", name: "High-Speed Blender", category: "Kitchen", price: 119, image: img("photo-1570222094114-d054a817e56b"), rating: 4, reviewCount: 1660, reviews: [{ author: "Pat", rating: 4, text: "Smoothies in seconds." }] },
  { id: "running-shorts", name: "5-inch Running Shorts", category: "Fitness", price: 42, image: img("photo-1483721310020-03333e577078"), rating: 4, reviewCount: 510, reviews: [{ author: "Kim", rating: 4, text: "Pockets actually hold a phone." }] },
  { id: "foam-roller", name: "Vibrating Foam Roller", category: "Fitness", price: 99, image: img("photo-1571019613454-1cb2f99b2d8b"), rating: 4, reviewCount: 330, reviews: [{ author: "Tess", rating: 4, text: "Hurts so good." }] },
  { id: "desk-mat", name: "Felt Desk Mat", category: "Tech", price: 29, image: img("photo-1527443224154-c4a3942d3acf"), rating: 5, reviewCount: 220, reviews: [{ author: "Owen", rating: 5, text: "Whole desk looks tidier." }] },
  { id: "scented-candle", name: "Cedar + Sage Candle", category: "Home", price: 28, image: img("photo-1602874801006-e26c4c5b5b8a"), rating: 5, reviewCount: 1340, reviews: [{ author: "Ivy", rating: 5, text: "Whole apartment smells cozy." }] },
  { id: "weekender", name: "Canvas Weekender Bag", category: "Apparel", price: 138, image: img("photo-1553062407-98eeb64c6a62"), rating: 4, reviewCount: 470, reviews: [{ author: "Gabe", rating: 4, text: "Perfect carry-on size." }] },
];

export function getProduct(id: string): Product | undefined {
  return CATALOG.find((p) => p.id === id);
}
