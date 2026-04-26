import type { Merchant, MerchantCategory } from "@/lib/payone/types";
import { discoverMerchantsNearby, getCachedMerchant } from "@/lib/merchants/discovery";

export type ProductCategory =
  | "Drinks"
  | "Pastries"
  | "Mains"
  | "Desserts"
  | "Other";

export type MerchantProduct = {
  id: string;
  name: string;
  priceCents: number;
  category: ProductCategory;
  photo: string | null;
  maxDiscountPct: number;
  enabled: boolean;
};

export type QuietWindowId =
  | "morning"
  | "lunch"
  | "afternoon"
  | "evening"
  | "late";

export type MerchantRules = {
  maxDiscountPct: number;
  dailyOfferBudgetCents: number;
  goalSummary: string;
};

export type RegisteredMerchant = Merchant & {
  address: string;
  cuisine?: string | null;
  products: MerchantProduct[];
  quietWindows: QuietWindowId[];
  rules: MerchantRules;
};

export type NearbyMerchant = {
  merchant: RegisteredMerchant;
  distanceKm: number;
};

const SEED: RegisteredMerchant[] = [
  {
    id: "mer_cafe_mueller",
    googlePlaceId: null,
    name: "Café Müller",
    category: "cafe",
    mcc: "5814",
    lat: 48.778,
    lon: 9.181,
    rating: 4.5,
    userRatingCount: 312,
    priceLevel: "PRICE_LEVEL_INEXPENSIVE",
    baselineDailyTx: 240,
    avgTicketCents: 620,
    address: "Königstraße 12, 70173 Stuttgart",
    products: [
      {
        id: "p_capp",
        name: "Cappuccino",
        priceCents: 380,
        category: "Drinks",
        photo:
          "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&q=80",
        maxDiscountPct: 20,
        enabled: true,
      },
      {
        id: "p_apfelstrudel",
        name: "Apfelstrudel",
        priceCents: 550,
        category: "Pastries",
        photo:
          "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800&q=80",
        maxDiscountPct: 30,
        enabled: true,
      },
      {
        id: "p_hotchoc",
        name: "Hot Chocolate",
        priceCents: 350,
        category: "Drinks",
        photo:
          "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=800&q=80",
        maxDiscountPct: 25,
        enabled: true,
      },
    ],
    quietWindows: ["afternoon"],
    rules: {
      maxDiscountPct: 25,
      dailyOfferBudgetCents: 4000,
      goalSummary: "Fill the 14:00–17:00 lull on weekdays.",
    },
  },
  {
    id: "mer_baeckerei_sommer",
    googlePlaceId: null,
    name: "Bäckerei Sommer",
    category: "bakery",
    mcc: "5462",
    lat: 48.7765,
    lon: 9.1785,
    rating: 4.3,
    userRatingCount: 188,
    priceLevel: "PRICE_LEVEL_INEXPENSIVE",
    baselineDailyTx: 310,
    avgTicketCents: 480,
    address: "Calwer Str. 6, 70173 Stuttgart",
    products: [
      {
        id: "p_brezel",
        name: "Butterbrezel",
        priceCents: 180,
        category: "Pastries",
        photo: null,
        maxDiscountPct: 20,
        enabled: true,
      },
      {
        id: "p_kaesebroetchen",
        name: "Käsebrötchen",
        priceCents: 240,
        category: "Pastries",
        photo: null,
        maxDiscountPct: 25,
        enabled: true,
      },
      {
        id: "p_filterkaffee",
        name: "Filterkaffee",
        priceCents: 220,
        category: "Drinks",
        photo: null,
        maxDiscountPct: 15,
        enabled: true,
      },
    ],
    quietWindows: ["late"],
    rules: {
      maxDiscountPct: 30,
      dailyOfferBudgetCents: 3000,
      goalSummary: "Move surplus baked goods after 17:00.",
    },
  },
  {
    id: "mer_trattoria_lorenzo",
    googlePlaceId: null,
    name: "Trattoria Da Lorenzo",
    category: "restaurant",
    mcc: "5812",
    lat: 48.779,
    lon: 9.182,
    rating: 4.6,
    userRatingCount: 524,
    priceLevel: "PRICE_LEVEL_MODERATE",
    baselineDailyTx: 140,
    avgTicketCents: 2200,
    address: "Bolzstraße 4, 70173 Stuttgart",
    products: [
      {
        id: "p_pizza_margh",
        name: "Pizza Margherita",
        priceCents: 1190,
        category: "Mains",
        photo: null,
        maxDiscountPct: 15,
        enabled: true,
      },
      {
        id: "p_pasta_carb",
        name: "Spaghetti Carbonara",
        priceCents: 1390,
        category: "Mains",
        photo: null,
        maxDiscountPct: 15,
        enabled: true,
      },
      {
        id: "p_tiramisu",
        name: "Tiramisù",
        priceCents: 590,
        category: "Desserts",
        photo: null,
        maxDiscountPct: 25,
        enabled: true,
      },
    ],
    quietWindows: ["lunch", "afternoon"],
    rules: {
      maxDiscountPct: 20,
      dailyOfferBudgetCents: 6000,
      goalSummary: "Pull foot traffic during the 14:30–17:30 gap.",
    },
  },
  {
    id: "mer_wineloft",
    googlePlaceId: null,
    name: "The Wine Loft",
    category: "bar",
    mcc: "5813",
    lat: 48.7755,
    lon: 9.184,
    rating: 4.4,
    userRatingCount: 96,
    priceLevel: "PRICE_LEVEL_EXPENSIVE",
    baselineDailyTx: 70,
    avgTicketCents: 2800,
    address: "Eberhardstraße 35, 70173 Stuttgart",
    products: [
      {
        id: "p_wine_glass",
        name: "House Riesling, glass",
        priceCents: 750,
        category: "Drinks",
        photo: null,
        maxDiscountPct: 15,
        enabled: true,
      },
      {
        id: "p_charcuterie",
        name: "Charcuterie board",
        priceCents: 1690,
        category: "Mains",
        photo: null,
        maxDiscountPct: 20,
        enabled: true,
      },
    ],
    quietWindows: ["evening"],
    rules: {
      maxDiscountPct: 20,
      dailyOfferBudgetCents: 5000,
      goalSummary: "Bring early-evening crowd before 20:00.",
    },
  },
  {
    id: "mer_spaetzle_haus",
    googlePlaceId: null,
    name: "Spätzle Haus",
    category: "restaurant",
    mcc: "5812",
    lat: 48.7748,
    lon: 9.1825,
    rating: 4.2,
    userRatingCount: 271,
    priceLevel: "PRICE_LEVEL_MODERATE",
    baselineDailyTx: 160,
    avgTicketCents: 1850,
    address: "Hirschstraße 22, 70173 Stuttgart",
    products: [
      {
        id: "p_kaesespaetzle",
        name: "Käsespätzle",
        priceCents: 1290,
        category: "Mains",
        photo: null,
        maxDiscountPct: 15,
        enabled: true,
      },
      {
        id: "p_maultaschen",
        name: "Maultaschen",
        priceCents: 1450,
        category: "Mains",
        photo: null,
        maxDiscountPct: 10,
        enabled: false,
      },
      {
        id: "p_blackforest",
        name: "Black Forest Cake",
        priceCents: 620,
        category: "Desserts",
        photo: null,
        maxDiscountPct: 20,
        enabled: true,
      },
    ],
    quietWindows: ["afternoon", "late"],
    rules: {
      maxDiscountPct: 20,
      dailyOfferBudgetCents: 5000,
      goalSummary: "Drive walk-ins between lunch and dinner services.",
    },
  },

  // ----- Dresden -----
  {
    id: "mer_dd_cafe_frauenkirche",
    googlePlaceId: null,
    name: "Café an der Frauenkirche",
    category: "cafe",
    mcc: "5814",
    lat: 51.0519,
    lon: 13.7415,
    rating: 4.4,
    userRatingCount: 287,
    priceLevel: "PRICE_LEVEL_MODERATE",
    baselineDailyTx: 220,
    avgTicketCents: 680,
    address: "Neumarkt 8, 01067 Dresden",
    products: [
      {
        id: "p_dd_stollen_slice",
        name: "Dresdner Stollen (slice)",
        priceCents: 420,
        category: "Pastries",
        photo:
          "https://images.unsplash.com/photo-1606914469633-cdcc73c81bf8?w=800&q=80",
        maxDiscountPct: 25,
        enabled: true,
      },
      {
        id: "p_dd_eierschecke",
        name: "Eierschecke",
        priceCents: 480,
        category: "Desserts",
        photo: null,
        maxDiscountPct: 25,
        enabled: true,
      },
      {
        id: "p_dd_milchkaffee",
        name: "Milchkaffee",
        priceCents: 390,
        category: "Drinks",
        photo:
          "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&q=80",
        maxDiscountPct: 20,
        enabled: true,
      },
    ],
    quietWindows: ["afternoon"],
    rules: {
      maxDiscountPct: 25,
      dailyOfferBudgetCents: 4500,
      goalSummary: "Fill the post-lunch dip on weekdays.",
    },
  },
  {
    id: "mer_dd_baeckerei_elbblick",
    googlePlaceId: null,
    name: "Bäckerei Elbblick",
    category: "bakery",
    mcc: "5462",
    lat: 51.054,
    lon: 13.739,
    rating: 4.2,
    userRatingCount: 142,
    priceLevel: "PRICE_LEVEL_INEXPENSIVE",
    baselineDailyTx: 340,
    avgTicketCents: 420,
    address: "Schloßstraße 14, 01067 Dresden",
    products: [
      {
        id: "p_dd_quarkkeulchen",
        name: "Quarkkeulchen (3 pcs)",
        priceCents: 320,
        category: "Pastries",
        photo: null,
        maxDiscountPct: 25,
        enabled: true,
      },
      {
        id: "p_dd_butterhoernchen",
        name: "Butterhörnchen",
        priceCents: 180,
        category: "Pastries",
        photo: null,
        maxDiscountPct: 20,
        enabled: true,
      },
      {
        id: "p_dd_filterkaffee",
        name: "Filterkaffee",
        priceCents: 200,
        category: "Drinks",
        photo: null,
        maxDiscountPct: 15,
        enabled: true,
      },
    ],
    quietWindows: ["late"],
    rules: {
      maxDiscountPct: 30,
      dailyOfferBudgetCents: 3000,
      goalSummary: "Move surplus baked goods after 17:00.",
    },
  },
  {
    id: "mer_dd_saechsische_schenke",
    googlePlaceId: null,
    name: "Sächsische Schenke",
    category: "restaurant",
    mcc: "5812",
    lat: 51.051,
    lon: 13.7398,
    rating: 4.5,
    userRatingCount: 612,
    priceLevel: "PRICE_LEVEL_MODERATE",
    baselineDailyTx: 150,
    avgTicketCents: 2400,
    address: "Altmarkt 4, 01067 Dresden",
    products: [
      {
        id: "p_dd_sauerbraten",
        name: "Sächsischer Sauerbraten",
        priceCents: 1690,
        category: "Mains",
        photo: null,
        maxDiscountPct: 15,
        enabled: true,
      },
      {
        id: "p_dd_kartoffelsuppe",
        name: "Kartoffelsuppe",
        priceCents: 690,
        category: "Mains",
        photo: null,
        maxDiscountPct: 20,
        enabled: true,
      },
      {
        id: "p_dd_eisbein",
        name: "Eisbein mit Sauerkraut",
        priceCents: 1890,
        category: "Mains",
        photo: null,
        maxDiscountPct: 10,
        enabled: true,
      },
    ],
    quietWindows: ["lunch", "afternoon"],
    rules: {
      maxDiscountPct: 20,
      dailyOfferBudgetCents: 6500,
      goalSummary: "Pull foot traffic during the 14:30–17:30 gap.",
    },
  },
  {
    id: "mer_dd_neustadt_taproom",
    googlePlaceId: null,
    name: "Neustadt Tap Room",
    category: "bar",
    mcc: "5813",
    lat: 51.061,
    lon: 13.748,
    rating: 4.3,
    userRatingCount: 184,
    priceLevel: "PRICE_LEVEL_MODERATE",
    baselineDailyTx: 95,
    avgTicketCents: 1850,
    address: "Alaunstraße 36, 01099 Dresden",
    products: [
      {
        id: "p_dd_radeberger",
        name: "Radeberger Pilsner (0.5L)",
        priceCents: 480,
        category: "Drinks",
        photo: null,
        maxDiscountPct: 20,
        enabled: true,
      },
      {
        id: "p_dd_craft_ipa",
        name: "Saxon Craft IPA",
        priceCents: 620,
        category: "Drinks",
        photo: null,
        maxDiscountPct: 15,
        enabled: true,
      },
      {
        id: "p_dd_pretzel_board",
        name: "Pretzel & cheese board",
        priceCents: 1290,
        category: "Mains",
        photo: null,
        maxDiscountPct: 25,
        enabled: true,
      },
    ],
    quietWindows: ["evening"],
    rules: {
      maxDiscountPct: 25,
      dailyOfferBudgetCents: 5500,
      goalSummary: "Bring early-evening crowd before 20:00.",
    },
  },
  {
    id: "mer_dd_kreuzkirchen_cafe",
    googlePlaceId: null,
    name: "Kreuzkirchen Café",
    category: "cafe",
    mcc: "5814",
    lat: 51.05,
    lon: 13.7396,
    rating: 4.1,
    userRatingCount: 203,
    priceLevel: "PRICE_LEVEL_INEXPENSIVE",
    baselineDailyTx: 195,
    avgTicketCents: 540,
    address: "An der Kreuzkirche 6, 01067 Dresden",
    products: [
      {
        id: "p_dd_cappuccino",
        name: "Cappuccino",
        priceCents: 360,
        category: "Drinks",
        photo:
          "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&q=80",
        maxDiscountPct: 20,
        enabled: true,
      },
      {
        id: "p_dd_apfelkuchen",
        name: "Apfelkuchen",
        priceCents: 420,
        category: "Desserts",
        photo: null,
        maxDiscountPct: 25,
        enabled: true,
      },
      {
        id: "p_dd_chai",
        name: "Chai Latte",
        priceCents: 410,
        category: "Drinks",
        photo: null,
        maxDiscountPct: 15,
        enabled: true,
      },
    ],
    quietWindows: ["morning", "afternoon"],
    rules: {
      maxDiscountPct: 25,
      dailyOfferBudgetCents: 3500,
      goalSummary: "Activate slow morning hours and afternoon slump.",
    },
  },
  {
    id: "mer_dd_striezelmarkt_konditorei",
    googlePlaceId: null,
    name: "Striezelmarkt Konditorei",
    category: "bakery",
    mcc: "5462",
    lat: 51.0508,
    lon: 13.7376,
    rating: 4.6,
    userRatingCount: 421,
    priceLevel: "PRICE_LEVEL_MODERATE",
    baselineDailyTx: 280,
    avgTicketCents: 720,
    address: "Altmarkt 12, 01067 Dresden",
    products: [
      {
        id: "p_dd_stollen_whole",
        name: "Dresdner Stollen (whole)",
        priceCents: 1980,
        category: "Pastries",
        photo:
          "https://images.unsplash.com/photo-1606914469633-cdcc73c81bf8?w=800&q=80",
        maxDiscountPct: 15,
        enabled: true,
      },
      {
        id: "p_dd_baumkuchen",
        name: "Baumkuchen slice",
        priceCents: 380,
        category: "Pastries",
        photo: null,
        maxDiscountPct: 20,
        enabled: true,
      },
      {
        id: "p_dd_pflaumenkuchen",
        name: "Pflaumenkuchen",
        priceCents: 340,
        category: "Pastries",
        photo: null,
        maxDiscountPct: 25,
        enabled: false,
      },
    ],
    quietWindows: ["late"],
    rules: {
      maxDiscountPct: 20,
      dailyOfferBudgetCents: 4500,
      goalSummary: "Clear premium pastries after 18:00.",
    },
  },
];

export function listMerchants(): RegisteredMerchant[] {
  return SEED;
}

export function getMerchantById(id: string): RegisteredMerchant | null {
  if (id.startsWith("mer_g_")) return getCachedMerchant(id);
  return SEED.find((m) => m.id === id) ?? null;
}

export async function findMerchantsNearby(
  lat: number,
  lon: number,
  radiusKm: number,
  category?: MerchantCategory,
): Promise<NearbyMerchant[]> {
  const types = category ? categoryToTypes(category) : undefined;
  const discovered = await discoverMerchantsNearby(lat, lon, radiusKm, types);
  if (discovered.length > 0) {
    return category
      ? discovered.filter(({ merchant }) => merchant.category === category)
      : discovered;
  }
  return SEED.filter((m) => !category || m.category === category)
    .map((m) => ({ merchant: m, distanceKm: haversineKm(lat, lon, m.lat, m.lon) }))
    .filter(({ distanceKm }) => distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

function categoryToTypes(category: MerchantCategory): string[] {
  switch (category) {
    case "cafe":
      return ["cafe", "coffee_shop"];
    case "restaurant":
      return ["restaurant", "meal_takeaway"];
    case "bakery":
      return ["bakery"];
    case "bar":
      return ["bar", "pub", "wine_bar"];
    case "retail":
      return ["store"];
  }
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1000) / 1000;
}
