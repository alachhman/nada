import type { CartItem } from "@/lib/types";

function img(id: string) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=70`;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  image: string;
  rating: number;
  etaMins: number;
  deliveryFee: number;
  menu: MenuItem[];
}

export const RESTAURANTS: Restaurant[] = [
  {
    id: "big-smash",
    name: "Big Smash Burgers",
    cuisine: "Burgers",
    image: img("photo-1568901346375-23c9450c58cd"),
    rating: 4.7,
    etaMins: 25,
    deliveryFee: 2.99,
    menu: [
      { id: "bs-classic", name: "Classic Smash", price: 11.5, image: img("photo-1550547660-d9450f859349"), description: "Double smash patty, American cheese, special sauce." },
      { id: "bs-bacon", name: "Bacon Crunch", price: 13.5, image: img("photo-1561758033-7e924f619af7"), description: "Crispy bacon, cheddar, pickled jalapeños, sriracha mayo." },
      { id: "bs-mushroom", name: "Mushroom Swiss", price: 12.5, image: img("photo-1586190848861-99aa4a171e90"), description: "Sautéed cremini mushrooms, Swiss, garlic aioli." },
      { id: "bs-fries", name: "Seasoned Fries", price: 5.0, image: img("photo-1573080496219-bb964701c394"), description: "Crispy shoestrings dusted with house seasoning blend." },
      { id: "bs-shake", name: "Vanilla Shake", price: 6.5, image: img("photo-1572490122747-3e9523c23e57"), description: "Hand-spun whole milk soft-serve, real vanilla bean." },
      { id: "bs-rings", name: "Onion Rings", price: 5.5, image: img("photo-1639024471283-03518883512d"), description: "Beer-battered Vidalia rings, served with smoky dip." },
    ],
  },
  {
    id: "tokyo-roll",
    name: "Tokyo Roll",
    cuisine: "Sushi",
    image: img("photo-1611143669185-af224c5e3252"),
    rating: 4.8,
    etaMins: 35,
    deliveryFee: 3.49,
    menu: [
      { id: "tr-spicy-tuna", name: "Spicy Tuna Roll", price: 14.0, image: img("photo-1617196034183-421b4040ed20"), description: "Tuna, cucumber, spicy mayo, sesame, micro greens." },
      { id: "tr-dragon", name: "Dragon Roll", price: 16.5, image: img("photo-1617196034234-8e96ee6e3ae8"), description: "Shrimp tempura inside, avocado on top, eel sauce." },
      { id: "tr-sashimi", name: "Sashimi Sampler", price: 22.0, image: img("photo-1534482421-64566f976cfa"), description: "Chef's selection of 9 premium slices, yuzu ponzu." },
      { id: "tr-edamame", name: "Salted Edamame", price: 5.5, image: img("photo-1590301157890-4810ed352733"), description: "Steamed soybeans, flaky sea salt, sesame oil." },
      { id: "tr-miso", name: "Miso Soup", price: 3.5, image: img("photo-1547592166-23ac45744acd"), description: "Dashi broth, silken tofu, wakame seaweed, scallions." },
      { id: "tr-gyoza", name: "Pan-Fried Gyoza", price: 9.0, image: img("photo-1496116218417-1a781b1c416c"), description: "Pork and cabbage dumplings, crispy bottom, ponzu dip." },
    ],
  },
  {
    id: "slice-theory",
    name: "Slice Theory",
    cuisine: "Pizza",
    image: img("photo-1565299624946-b28f40a0ae38"),
    rating: 4.6,
    etaMins: 30,
    deliveryFee: 1.99,
    menu: [
      { id: "st-margherita", name: "Margherita", price: 17.0, image: img("photo-1574071318508-1cdbab80d002"), description: "San Marzano tomato, fresh mozzarella, torn basil, olive oil." },
      { id: "st-pepperoni", name: "Old-School Pepperoni", price: 18.5, image: img("photo-1628840042765-356cda07504e"), description: "Cup-and-char pepperoni, low-moisture mozz, oregano." },
      { id: "st-white", name: "White Truffle Pie", price: 21.0, image: img("photo-1513104890138-7c749659a591"), description: "Ricotta, roasted garlic, truffle oil, arugula finish." },
      { id: "st-caesar", name: "Caesar Salad", price: 10.5, image: img("photo-1546793665-c74683f339c1"), description: "Romaine hearts, anchovy dressing, shaved parm, croutons." },
      { id: "st-garlic", name: "Garlic Knots (6)", price: 6.5, image: img("photo-1619740455993-9e612b1af08a"), description: "Pillowy knots, roasted garlic butter, parsley, parmesan." },
      { id: "st-tiramisu", name: "Tiramisu", price: 8.0, image: img("photo-1571877227200-a0d98ea607e9"), description: "Classic Italian layers, espresso-soaked ladyfingers, cocoa." },
    ],
  },
  {
    id: "taqueria-loca",
    name: "Taqueria Loca",
    cuisine: "Tacos",
    image: img("photo-1613514785940-daed07799d9b"),
    rating: 4.5,
    etaMins: 20,
    deliveryFee: 0.99,
    menu: [
      { id: "tl-birria", name: "Birria Tacos (3)", price: 15.0, image: img("photo-1599974579688-8dbdd335c77f"), description: "Slow-braised beef, consomme dip, oaxacan cheese, cilantro." },
      { id: "tl-al-pastor", name: "Al Pastor Tacos (3)", price: 13.5, image: img("photo-1561758033-d89a9ad46330"), description: "Achiote pork, pineapple, onion, cilantro on corn tortilla." },
      { id: "tl-elote", name: "Street Corn (Elote)", price: 6.5, image: img("photo-1567620905732-2d1ec7ab7445"), description: "Grilled corn on the cob, cotija, chili-lime mayo, tajin." },
      { id: "tl-guac", name: "Chunky Guacamole + Chips", price: 8.5, image: img("photo-1539755530862-00f623c00f52"), description: "Hand-mashed avocado, lime, jalapeno, fresh salsa fresca." },
      { id: "tl-horchata", name: "Horchata", price: 4.5, image: img("photo-1490457843367-34b23b2b8f32"), description: "House-made cinnamon rice drink, sweet and ice cold." },
      { id: "tl-burrito", name: "Carnitas Burrito", price: 14.5, image: img("photo-1626700051175-6818013e1d4f"), description: "Slow-cooked pork, black beans, rice, salsa, sour cream." },
    ],
  },
  {
    id: "greenbox",
    name: "Greenbox Bowls",
    cuisine: "Salads & Bowls",
    image: img("photo-1512621776951-a57141f2eefd"),
    rating: 4.6,
    etaMins: 22,
    deliveryFee: 2.49,
    menu: [
      { id: "gb-harvest", name: "Harvest Bowl", price: 15.5, image: img("photo-1546069901-ba9599a7e63c"), description: "Roasted sweet potato, farro, kale, pecans, apple cider vin." },
      { id: "gb-protein", name: "Power Protein Bowl", price: 16.5, image: img("photo-1490645935967-10de6ba17061"), description: "Grilled chicken, quinoa, edamame, tahini dressing." },
      { id: "gb-caesar-wrap", name: "Caesar Wrap", price: 13.0, image: img("photo-1540189549336-e6e99e8c47c5"), description: "Crispy chicken, romaine, parmesan, caesar, flour tortilla." },
      { id: "gb-smoothie", name: "Green Detox Smoothie", price: 9.5, image: img("photo-1638176066666-ffb2f013c7dd"), description: "Spinach, banana, mango, ginger, coconut water base." },
      { id: "gb-lentil", name: "Lentil Soup", price: 7.5, image: img("photo-1547592180-85f173990554"), description: "Red lentils, cumin, lemon, topped with crispy shallots." },
      { id: "gb-avocado-toast", name: "Avocado Toast", price: 11.0, image: img("photo-1603046891744-1f9a07c9f4d2"), description: "Multigrain toast, smashed avocado, radish, chili flakes, egg." },
    ],
  },
];

export function getRestaurant(id: string): Restaurant | undefined {
  return RESTAURANTS.find((r) => r.id === id);
}

export function menuItemToCartItem(m: MenuItem): CartItem {
  return { id: m.id, name: m.name, price: m.price, image: m.image, qty: 1 };
}
