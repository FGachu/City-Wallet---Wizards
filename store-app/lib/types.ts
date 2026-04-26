export type DemandSignal = "bring-them-in" | "steady" | "we-are-full";

export type Product = {
  id: string;
  name: string;
  price: number;
  category: "Drinks" | "Pastries" | "Mains" | "Desserts";
  photo: string;
  maxDiscount: number;
  enabled: boolean;
};

export type OfferActivityStatus = "accepted" | "shown" | "dismissed";

export type OfferActivity = {
  id: string;
  offer: string;
  context: string;
  status: OfferActivityStatus;
  time: string;
};

export type KPI = {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "flat";
};
