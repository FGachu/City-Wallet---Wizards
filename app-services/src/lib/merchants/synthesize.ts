import type { MerchantCategory } from "@/lib/payone/types";
import type { PlaceItem } from "@/app/api/places/route";
import type {
  MerchantProduct,
  MerchantRules,
  QuietWindowId,
  RegisteredMerchant,
} from "@/lib/merchants/catalog";

const TYPE_TO_CATEGORY: Record<string, MerchantCategory> = {
  cafe: "cafe",
  coffee_shop: "cafe",
  restaurant: "restaurant",
  meal_takeaway: "restaurant",
  meal_delivery: "restaurant",
  pizza_restaurant: "restaurant",
  italian_restaurant: "restaurant",
  fast_food_restaurant: "restaurant",
  french_restaurant: "restaurant",
  spanish_restaurant: "restaurant",
  asian_restaurant: "restaurant",
  japanese_restaurant: "restaurant",
  chinese_restaurant: "restaurant",
  indian_restaurant: "restaurant",
  south_indian_restaurant: "restaurant",
  mexican_restaurant: "restaurant",
  thai_restaurant: "restaurant",
  vegetarian_restaurant: "restaurant",
  vegan_restaurant: "restaurant",
  steak_house: "restaurant",
  seafood_restaurant: "restaurant",
  hamburger_restaurant: "restaurant",
  american_restaurant: "restaurant",
  korean_restaurant: "restaurant",
  korean_barbecue_restaurant: "restaurant",
  vietnamese_restaurant: "restaurant",
  greek_restaurant: "restaurant",
  turkish_restaurant: "restaurant",
  middle_eastern_restaurant: "restaurant",
  mediterranean_restaurant: "restaurant",
  brazilian_restaurant: "restaurant",
  ramen_restaurant: "restaurant",
  sushi_restaurant: "restaurant",
  californian_restaurant: "restaurant",
  ice_cream_shop: "cafe",
  breakfast_restaurant: "cafe",
  brunch_restaurant: "cafe",
  bakery: "bakery",
  bar: "bar",
  pub: "bar",
  wine_bar: "bar",
  night_club: "bar",
  store: "retail",
  convenience_store: "retail",
};

export function categoryFromPlace(place: PlaceItem): MerchantCategory {
  if (place.primaryType && TYPE_TO_CATEGORY[place.primaryType]) {
    return TYPE_TO_CATEGORY[place.primaryType];
  }
  for (const t of place.types ?? []) {
    if (TYPE_TO_CATEGORY[t]) return TYPE_TO_CATEGORY[t];
  }
  return "cafe";
}

type ProductTemplate = Omit<MerchantProduct, "id" | "enabled"> & { enabled?: boolean };

type CategoryTemplate = {
  mcc: string;
  avgTicketCents: number;
  rules: MerchantRules;
  quietWindows: QuietWindowId[];
  products: ProductTemplate[];
};

const PHOTOS = {
  cappuccino: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&q=80",
  latte: "https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=800&q=80",
  pastry: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800&q=80",
  pasta: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80",
  pizza: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80",
  salad: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
  brezel: "https://images.unsplash.com/photo-1568051243851-f9b136146e97?w=800&q=80",
  croissant: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80",
  sandwich: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80",
  beer: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800&q=80",
  wine: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80",
  retail: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
  tacos: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80",
  burrito: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80",
  curry: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80",
  naan: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800&q=80",
  sushi: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80",
  ramen: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80",
  dumplings: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&q=80",
  noodles: "https://images.unsplash.com/photo-1552611052-33e04de081de?w=800&q=80",
  padthai: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80",
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
  fries: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80",
  steak: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80",
  fish: "https://images.unsplash.com/photo-1544982503-9f984c14501a?w=800&q=80",
  tapas: "https://images.unsplash.com/photo-1535850579364-6ad8e0d4eddd?w=800&q=80",
  veggie: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
  cocktail: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80",
};

const CATEGORY_TEMPLATES: Record<MerchantCategory, CategoryTemplate> = {
  cafe: {
    mcc: "5814",
    avgTicketCents: 450,
    rules: {
      maxDiscountPct: 25,
      dailyOfferBudgetCents: 5000,
      goalSummary: "Fill quiet morning and afternoon hours with regulars.",
    },
    quietWindows: ["morning", "afternoon"],
    products: [
      { name: "Cappuccino", priceCents: 380, category: "Drinks", photo: PHOTOS.cappuccino, maxDiscountPct: 25 },
      { name: "Latte", priceCents: 420, category: "Drinks", photo: PHOTOS.latte, maxDiscountPct: 20 },
      { name: "Pastry of the day", priceCents: 350, category: "Pastries", photo: PHOTOS.pastry, maxDiscountPct: 30 },
    ],
  },
  restaurant: {
    mcc: "5812",
    avgTicketCents: 1500,
    rules: {
      maxDiscountPct: 25,
      dailyOfferBudgetCents: 8000,
      goalSummary: "Fill empty tables in slow lunch and early-evening windows.",
    },
    quietWindows: ["lunch", "afternoon"],
    products: [
      { name: "Pasta of the day", priceCents: 1190, category: "Mains", photo: PHOTOS.pasta, maxDiscountPct: 20 },
      { name: "Pizza Margherita", priceCents: 1190, category: "Mains", photo: PHOTOS.pizza, maxDiscountPct: 20 },
      { name: "Seasonal salad", priceCents: 980, category: "Mains", photo: PHOTOS.salad, maxDiscountPct: 25 },
    ],
  },
  bakery: {
    mcc: "5462",
    avgTicketCents: 380,
    rules: {
      maxDiscountPct: 20,
      dailyOfferBudgetCents: 3000,
      goalSummary: "Move pastries before close.",
    },
    quietWindows: ["afternoon", "evening"],
    products: [
      { name: "Brezel + coffee", priceCents: 520, category: "Pastries", photo: PHOTOS.brezel, maxDiscountPct: 15 },
      { name: "Croissant", priceCents: 320, category: "Pastries", photo: PHOTOS.croissant, maxDiscountPct: 25 },
      { name: "Sandwich of the day", priceCents: 580, category: "Mains", photo: PHOTOS.sandwich, maxDiscountPct: 20 },
    ],
  },
  bar: {
    mcc: "5813",
    avgTicketCents: 700,
    rules: {
      maxDiscountPct: 20,
      dailyOfferBudgetCents: 6000,
      goalSummary: "Drive happy-hour traffic before peak.",
    },
    quietWindows: ["afternoon", "evening"],
    products: [
      { name: "Local beer", priceCents: 560, category: "Drinks", photo: PHOTOS.beer, maxDiscountPct: 20 },
      { name: "Glass of wine", priceCents: 740, category: "Drinks", photo: PHOTOS.wine, maxDiscountPct: 15 },
    ],
  },
  retail: {
    mcc: "5999",
    avgTicketCents: 1500,
    rules: {
      maxDiscountPct: 15,
      dailyOfferBudgetCents: 4000,
      goalSummary: "Drive foot traffic during quiet hours.",
    },
    quietWindows: ["morning", "afternoon"],
    products: [
      { name: "Featured item", priceCents: 1500, category: "Other", photo: PHOTOS.retail, maxDiscountPct: 15 },
    ],
  },
};

type CuisineSubtype = {
  cuisineLabel: string;
  products: ProductTemplate[];
};

const SUBTYPE_OVERRIDES: Record<string, CuisineSubtype> = {
  pizza_restaurant: {
    cuisineLabel: "Pizza",
    products: [
      { name: "Pizza Margherita", priceCents: 1190, category: "Mains", photo: PHOTOS.pizza, maxDiscountPct: 20 },
      { name: "Pizza Diavola", priceCents: 1290, category: "Mains", photo: PHOTOS.pizza, maxDiscountPct: 20 },
      { name: "Garlic bread", priceCents: 480, category: "Other", photo: PHOTOS.pasta, maxDiscountPct: 25 },
    ],
  },
  italian_restaurant: {
    cuisineLabel: "Italian",
    products: [
      { name: "Pasta of the day", priceCents: 1190, category: "Mains", photo: PHOTOS.pasta, maxDiscountPct: 20 },
      { name: "Pizza Margherita", priceCents: 1190, category: "Mains", photo: PHOTOS.pizza, maxDiscountPct: 20 },
      { name: "Tiramisu", priceCents: 580, category: "Desserts", photo: PHOTOS.pastry, maxDiscountPct: 25 },
    ],
  },
  mexican_restaurant: {
    cuisineLabel: "Mexican",
    products: [
      { name: "Tacos al pastor (3pc)", priceCents: 980, category: "Mains", photo: PHOTOS.tacos, maxDiscountPct: 20 },
      { name: "Burrito", priceCents: 1090, category: "Mains", photo: PHOTOS.burrito, maxDiscountPct: 20 },
      { name: "Quesadilla", priceCents: 880, category: "Mains", photo: PHOTOS.tacos, maxDiscountPct: 25 },
    ],
  },
  indian_restaurant: {
    cuisineLabel: "Indian",
    products: [
      { name: "Chicken tikka masala", priceCents: 1290, category: "Mains", photo: PHOTOS.curry, maxDiscountPct: 20 },
      { name: "Naan", priceCents: 320, category: "Other", photo: PHOTOS.naan, maxDiscountPct: 25 },
      { name: "Samosa (2pc)", priceCents: 480, category: "Other", photo: PHOTOS.naan, maxDiscountPct: 25 },
    ],
  },
  chinese_restaurant: {
    cuisineLabel: "Chinese",
    products: [
      { name: "Fried rice", priceCents: 980, category: "Mains", photo: PHOTOS.noodles, maxDiscountPct: 20 },
      { name: "Dumplings (6pc)", priceCents: 780, category: "Mains", photo: PHOTOS.dumplings, maxDiscountPct: 25 },
      { name: "Spring rolls", priceCents: 480, category: "Other", photo: PHOTOS.dumplings, maxDiscountPct: 25 },
    ],
  },
  japanese_restaurant: {
    cuisineLabel: "Japanese",
    products: [
      { name: "Sushi platter (8pc)", priceCents: 1490, category: "Mains", photo: PHOTOS.sushi, maxDiscountPct: 20 },
      { name: "Miso ramen", priceCents: 1290, category: "Mains", photo: PHOTOS.ramen, maxDiscountPct: 20 },
      { name: "Edamame", priceCents: 480, category: "Other", photo: PHOTOS.sushi, maxDiscountPct: 25 },
    ],
  },
  thai_restaurant: {
    cuisineLabel: "Thai",
    products: [
      { name: "Pad Thai", priceCents: 1290, category: "Mains", photo: PHOTOS.padthai, maxDiscountPct: 20 },
      { name: "Tom Yum soup", priceCents: 1190, category: "Mains", photo: PHOTOS.padthai, maxDiscountPct: 20 },
      { name: "Spring rolls", priceCents: 580, category: "Other", photo: PHOTOS.padthai, maxDiscountPct: 25 },
    ],
  },
  asian_restaurant: {
    cuisineLabel: "Asian",
    products: [
      { name: "Stir-fried noodles", priceCents: 1190, category: "Mains", photo: PHOTOS.noodles, maxDiscountPct: 20 },
      { name: "Spring rolls", priceCents: 480, category: "Other", photo: PHOTOS.dumplings, maxDiscountPct: 25 },
    ],
  },
  french_restaurant: {
    cuisineLabel: "French",
    products: [
      { name: "Croque Monsieur", priceCents: 1190, category: "Mains", photo: PHOTOS.sandwich, maxDiscountPct: 20 },
      { name: "Quiche slice", priceCents: 980, category: "Mains", photo: PHOTOS.pastry, maxDiscountPct: 25 },
      { name: "Macaron (3pc)", priceCents: 580, category: "Desserts", photo: PHOTOS.pastry, maxDiscountPct: 25 },
    ],
  },
  spanish_restaurant: {
    cuisineLabel: "Spanish",
    products: [
      { name: "Tapas trio", priceCents: 1290, category: "Mains", photo: PHOTOS.tapas, maxDiscountPct: 20 },
      { name: "Patatas bravas", priceCents: 680, category: "Other", photo: PHOTOS.tapas, maxDiscountPct: 25 },
      { name: "Sangria glass", priceCents: 580, category: "Drinks", photo: PHOTOS.wine, maxDiscountPct: 20 },
    ],
  },
  seafood_restaurant: {
    cuisineLabel: "Seafood",
    products: [
      { name: "Fish & chips", priceCents: 1390, category: "Mains", photo: PHOTOS.fish, maxDiscountPct: 20 },
      { name: "Calamari", priceCents: 980, category: "Other", photo: PHOTOS.fish, maxDiscountPct: 25 },
    ],
  },
  steak_house: {
    cuisineLabel: "Steakhouse",
    products: [
      { name: "Steak frites", priceCents: 2490, category: "Mains", photo: PHOTOS.steak, maxDiscountPct: 15 },
      { name: "House salad", priceCents: 980, category: "Mains", photo: PHOTOS.salad, maxDiscountPct: 25 },
    ],
  },
  hamburger_restaurant: {
    cuisineLabel: "Burgers",
    products: [
      { name: "Cheeseburger combo", priceCents: 980, category: "Mains", photo: PHOTOS.burger, maxDiscountPct: 20 },
      { name: "Chicken sandwich", priceCents: 880, category: "Mains", photo: PHOTOS.burger, maxDiscountPct: 25 },
      { name: "Fries", priceCents: 380, category: "Other", photo: PHOTOS.fries, maxDiscountPct: 25 },
    ],
  },
  fast_food_restaurant: {
    cuisineLabel: "Fast food",
    products: [
      { name: "Cheeseburger combo", priceCents: 980, category: "Mains", photo: PHOTOS.burger, maxDiscountPct: 20 },
      { name: "Fries", priceCents: 380, category: "Other", photo: PHOTOS.fries, maxDiscountPct: 25 },
    ],
  },
  vegetarian_restaurant: {
    cuisineLabel: "Vegetarian",
    products: [
      { name: "Veggie bowl", priceCents: 980, category: "Mains", photo: PHOTOS.veggie, maxDiscountPct: 20 },
      { name: "Hummus plate", priceCents: 780, category: "Other", photo: PHOTOS.veggie, maxDiscountPct: 25 },
    ],
  },
  pub: {
    cuisineLabel: "Pub",
    products: [
      { name: "Fish & chips", priceCents: 1290, category: "Mains", photo: PHOTOS.fish, maxDiscountPct: 20 },
      { name: "Local beer", priceCents: 560, category: "Drinks", photo: PHOTOS.beer, maxDiscountPct: 20 },
    ],
  },
  wine_bar: {
    cuisineLabel: "Wine bar",
    products: [
      { name: "Glass of house red", priceCents: 740, category: "Drinks", photo: PHOTOS.wine, maxDiscountPct: 15 },
      { name: "Cheese board", priceCents: 1290, category: "Other", photo: PHOTOS.tapas, maxDiscountPct: 20 },
    ],
  },
  night_club: {
    cuisineLabel: "Night club",
    products: [
      { name: "Cocktail", priceCents: 1290, category: "Drinks", photo: PHOTOS.cocktail, maxDiscountPct: 15 },
      { name: "Premium spirit", priceCents: 1490, category: "Drinks", photo: PHOTOS.cocktail, maxDiscountPct: 15 },
    ],
  },
  american_restaurant: {
    cuisineLabel: "American",
    products: [
      { name: "House burger", priceCents: 1390, category: "Mains", photo: PHOTOS.burger, maxDiscountPct: 20 },
      { name: "Buffalo wings (6pc)", priceCents: 980, category: "Other", photo: PHOTOS.fries, maxDiscountPct: 25 },
      { name: "Cobb salad", priceCents: 1180, category: "Mains", photo: PHOTOS.salad, maxDiscountPct: 25 },
    ],
  },
  korean_restaurant: {
    cuisineLabel: "Korean",
    products: [
      { name: "Bibimbap", priceCents: 1290, category: "Mains", photo: PHOTOS.noodles, maxDiscountPct: 20 },
      { name: "Bulgogi", priceCents: 1590, category: "Mains", photo: PHOTOS.steak, maxDiscountPct: 20 },
      { name: "Kimchi side", priceCents: 380, category: "Other", photo: PHOTOS.veggie, maxDiscountPct: 25 },
    ],
  },
  korean_barbecue_restaurant: {
    cuisineLabel: "Korean BBQ",
    products: [
      { name: "BBQ combo for one", priceCents: 2490, category: "Mains", photo: PHOTOS.steak, maxDiscountPct: 15 },
      { name: "Bulgogi", priceCents: 1590, category: "Mains", photo: PHOTOS.steak, maxDiscountPct: 20 },
      { name: "Banchan platter", priceCents: 580, category: "Other", photo: PHOTOS.veggie, maxDiscountPct: 25 },
    ],
  },
  vietnamese_restaurant: {
    cuisineLabel: "Vietnamese",
    products: [
      { name: "Phở bowl", priceCents: 1290, category: "Mains", photo: PHOTOS.ramen, maxDiscountPct: 20 },
      { name: "Bánh mì", priceCents: 880, category: "Mains", photo: PHOTOS.sandwich, maxDiscountPct: 25 },
      { name: "Spring rolls", priceCents: 580, category: "Other", photo: PHOTOS.dumplings, maxDiscountPct: 25 },
    ],
  },
  greek_restaurant: {
    cuisineLabel: "Greek",
    products: [
      { name: "Gyro plate", priceCents: 1290, category: "Mains", photo: PHOTOS.tapas, maxDiscountPct: 20 },
      { name: "Souvlaki", priceCents: 1190, category: "Mains", photo: PHOTOS.tapas, maxDiscountPct: 20 },
      { name: "Greek salad", priceCents: 980, category: "Mains", photo: PHOTOS.salad, maxDiscountPct: 25 },
    ],
  },
  turkish_restaurant: {
    cuisineLabel: "Turkish",
    products: [
      { name: "Kebab plate", priceCents: 1290, category: "Mains", photo: PHOTOS.tapas, maxDiscountPct: 20 },
      { name: "Lahmacun", priceCents: 780, category: "Mains", photo: PHOTOS.pizza, maxDiscountPct: 25 },
    ],
  },
  middle_eastern_restaurant: {
    cuisineLabel: "Middle Eastern",
    products: [
      { name: "Falafel wrap", priceCents: 980, category: "Mains", photo: PHOTOS.sandwich, maxDiscountPct: 20 },
      { name: "Hummus plate", priceCents: 880, category: "Other", photo: PHOTOS.veggie, maxDiscountPct: 25 },
      { name: "Shawarma", priceCents: 1190, category: "Mains", photo: PHOTOS.tapas, maxDiscountPct: 20 },
    ],
  },
  mediterranean_restaurant: {
    cuisineLabel: "Mediterranean",
    products: [
      { name: "Grilled chicken plate", priceCents: 1290, category: "Mains", photo: PHOTOS.tapas, maxDiscountPct: 20 },
      { name: "Hummus & pita", priceCents: 780, category: "Other", photo: PHOTOS.veggie, maxDiscountPct: 25 },
      { name: "Greek salad", priceCents: 980, category: "Mains", photo: PHOTOS.salad, maxDiscountPct: 25 },
    ],
  },
  south_indian_restaurant: {
    cuisineLabel: "South Indian",
    products: [
      { name: "Masala dosa", priceCents: 1090, category: "Mains", photo: PHOTOS.curry, maxDiscountPct: 20 },
      { name: "Idli sambar", priceCents: 880, category: "Mains", photo: PHOTOS.curry, maxDiscountPct: 25 },
      { name: "Filter coffee", priceCents: 380, category: "Drinks", photo: PHOTOS.cappuccino, maxDiscountPct: 25 },
    ],
  },
  ramen_restaurant: {
    cuisineLabel: "Ramen",
    products: [
      { name: "Tonkotsu ramen", priceCents: 1490, category: "Mains", photo: PHOTOS.ramen, maxDiscountPct: 20 },
      { name: "Gyoza (5pc)", priceCents: 680, category: "Other", photo: PHOTOS.dumplings, maxDiscountPct: 25 },
    ],
  },
  sushi_restaurant: {
    cuisineLabel: "Sushi",
    products: [
      { name: "Sushi platter (10pc)", priceCents: 1890, category: "Mains", photo: PHOTOS.sushi, maxDiscountPct: 20 },
      { name: "Salmon nigiri (4pc)", priceCents: 1090, category: "Mains", photo: PHOTOS.sushi, maxDiscountPct: 20 },
    ],
  },
  ice_cream_shop: {
    cuisineLabel: "Ice cream",
    products: [
      { name: "Single scoop", priceCents: 480, category: "Desserts", photo: PHOTOS.pastry, maxDiscountPct: 25 },
      { name: "Sundae", priceCents: 880, category: "Desserts", photo: PHOTOS.pastry, maxDiscountPct: 20 },
    ],
  },
  breakfast_restaurant: {
    cuisineLabel: "Breakfast",
    products: [
      { name: "Pancake stack", priceCents: 1090, category: "Mains", photo: PHOTOS.pastry, maxDiscountPct: 20 },
      { name: "Eggs benedict", priceCents: 1390, category: "Mains", photo: PHOTOS.sandwich, maxDiscountPct: 20 },
      { name: "Cappuccino", priceCents: 380, category: "Drinks", photo: PHOTOS.cappuccino, maxDiscountPct: 25 },
    ],
  },
  brunch_restaurant: {
    cuisineLabel: "Brunch",
    products: [
      { name: "Avocado toast", priceCents: 1090, category: "Mains", photo: PHOTOS.sandwich, maxDiscountPct: 25 },
      { name: "Eggs benedict", priceCents: 1390, category: "Mains", photo: PHOTOS.sandwich, maxDiscountPct: 20 },
      { name: "Mimosa", priceCents: 980, category: "Drinks", photo: PHOTOS.wine, maxDiscountPct: 20 },
    ],
  },
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function deriveBaselineDailyTx(userRatingCount: number | null): number {
  const reviews = userRatingCount ?? 50;
  return clamp(Math.round(reviews / 5), 40, 400);
}

const GENERIC_SUBTYPES = new Set([
  "vegetarian_restaurant",
  "vegan_restaurant",
  "asian_restaurant",
  "fast_food_restaurant",
]);

function pickSubtype(place: PlaceItem): CuisineSubtype | null {
  const candidates = [place.primaryType, ...(place.types ?? [])].filter(
    (t): t is string => !!t,
  );
  const specific = candidates.find(
    (t) => SUBTYPE_OVERRIDES[t] && !GENERIC_SUBTYPES.has(t),
  );
  if (specific) return SUBTYPE_OVERRIDES[specific];
  const generic = candidates.find((t) => SUBTYPE_OVERRIDES[t]);
  if (generic) return SUBTYPE_OVERRIDES[generic];
  return null;
}

export function synthesizeMerchant(place: PlaceItem): RegisteredMerchant | null {
  if (!place.id || !place.name || !place.location) return null;
  if (place.businessStatus && place.businessStatus !== "OPERATIONAL") return null;

  const category = categoryFromPlace(place);
  const template = CATEGORY_TEMPLATES[category];
  const subtype = pickSubtype(place);
  const productSet = subtype?.products ?? template.products;
  const cuisineLabel = subtype?.cuisineLabel ?? place.primaryTypeLabel ?? null;
  const merchantId = `mer_g_${place.id}`;

  const products: MerchantProduct[] = productSet.map((p, i) => ({
    id: `p_${place.id}_${i}`,
    name: p.name,
    priceCents: p.priceCents,
    category: p.category,
    photo: p.photo,
    maxDiscountPct: p.maxDiscountPct,
    enabled: true,
  }));

  return {
    id: merchantId,
    googlePlaceId: place.id,
    name: place.name,
    category,
    cuisine: cuisineLabel,
    mcc: template.mcc,
    lat: place.location.lat,
    lon: place.location.lon,
    rating: place.rating,
    userRatingCount: place.userRatingCount ?? 0,
    priceLevel: place.priceLevel,
    baselineDailyTx: deriveBaselineDailyTx(place.userRatingCount),
    avgTicketCents: template.avgTicketCents,
    address: place.address ?? "",
    products,
    quietWindows: template.quietWindows,
    rules: { ...template.rules },
  };
}
