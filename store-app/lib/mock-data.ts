import type { KPI, OfferActivity, Product } from "./types";

export const mockKPIs: KPI[] = [
  { label: "Offers shown", value: "143", change: "+12%", trend: "up" },
  { label: "Acceptance rate", value: "27%", change: "+4 pp", trend: "up" },
  { label: "Redemptions", value: "39", change: "+8", trend: "up" },
  { label: "Revenue lift", value: "€324", change: "+€96", trend: "up" },
];

export const mockOfferActivity: OfferActivity[] = [
  {
    id: "1",
    offer: "Cappuccino + warm pastry — €4.50",
    context: "Cold weather · 80m away · fresh batch ready",
    status: "accepted",
    time: "2 min ago",
  },
  {
    id: "2",
    offer: "15% off lunch menu",
    context: "Tuesday lunch · low transaction volume",
    status: "shown",
    time: "5 min ago",
  },
  {
    id: "3",
    offer: "Free dessert with main course",
    context: "Dinner window · steady demand",
    status: "dismissed",
    time: "12 min ago",
  },
  {
    id: "4",
    offer: "Hot chocolate — €3.20",
    context: "Rain forecast · evening window",
    status: "accepted",
    time: "18 min ago",
  },
  {
    id: "5",
    offer: "Coffee + Apfelstrudel bundle",
    context: "Browsing nearby · warm-drink history",
    status: "accepted",
    time: "26 min ago",
  },
];

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Cappuccino",
    price: 3.8,
    category: "Drinks",
    photo:
      "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&q=80",
    maxDiscount: 20,
    enabled: true,
  },
  {
    id: "2",
    name: "Apfelstrudel",
    price: 5.5,
    category: "Pastries",
    photo:
      "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800&q=80",
    maxDiscount: 30,
    enabled: true,
  },
  {
    id: "3",
    name: "Käsespätzle",
    price: 12.9,
    category: "Mains",
    photo:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80",
    maxDiscount: 15,
    enabled: true,
  },
  {
    id: "4",
    name: "Maultaschen",
    price: 14.5,
    category: "Mains",
    photo:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80",
    maxDiscount: 10,
    enabled: false,
  },
  {
    id: "5",
    name: "Hot Chocolate",
    price: 3.5,
    category: "Drinks",
    photo:
      "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=800&q=80",
    maxDiscount: 25,
    enabled: true,
  },
  {
    id: "6",
    name: "Black Forest Cake",
    price: 6.2,
    category: "Desserts",
    photo:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
    maxDiscount: 20,
    enabled: true,
  },
];

export const mockContextSignals = [
  { label: "Weather", value: "11°C · Overcast", detail: "Stuttgart Innenstadt" },
  { label: "Foot traffic", value: "Above average", detail: "Königstraße area" },
  { label: "Local event", value: "None within 1 km", detail: "Next: Fr 19:00" },
  { label: "Payone density", value: "Below avg.", detail: "Quiet window 11–14" },
];
