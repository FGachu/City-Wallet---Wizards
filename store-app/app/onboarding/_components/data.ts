import {
  Building2,
  Clock,
  CloudDrizzle,
  CreditCard,
  Landmark,
  MapPin,
  Moon,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
} from "lucide-react";
import type {
  MenuItem,
  TimeWindow,
  Variant,
  VerifyMethodInfo,
} from "./types";

export const SCANNED_ITEMS: MenuItem[] = [
  { id: "1", name: "Cappuccino", price: 3.8, category: "Drinks" },
  { id: "2", name: "Espresso doppio", price: 2.4, category: "Drinks" },
  { id: "3", name: "Hot chocolate", price: 3.5, category: "Drinks" },
  { id: "4", name: "Apfelstrudel", price: 5.5, category: "Pastries" },
  { id: "5", name: "Butter croissant", price: 2.8, category: "Pastries" },
  { id: "6", name: "Käsespätzle", price: 12.9, category: "Mains" },
  { id: "7", name: "Maultaschen", price: 14.5, category: "Mains" },
  { id: "8", name: "Black Forest cake", price: 6.2, category: "Desserts" },
];

export const TIME_WINDOWS: TimeWindow[] = [
  { id: "morning", label: "Morning", hint: "07–10h", icon: Sunrise },
  { id: "lunch", label: "Lunch", hint: "12–14h", icon: Sun },
  { id: "afternoon", label: "Afternoon slump", hint: "14–17h", icon: Sunset },
  { id: "evening", label: "Evening", hint: "17–20h", icon: CloudDrizzle },
  { id: "late", label: "Late night", hint: "20–23h", icon: Moon },
];

export const AGGRESSIVENESS = [
  {
    label: "Conservative",
    desc: "Up to 10% off · only the slowest 30 minutes",
    cap: 10,
  },
  {
    label: "Standard",
    desc: "Up to 20% off · slow windows only",
    cap: 20,
  },
  {
    label: "Bold",
    desc: "Up to 30% off · broader windows, more pushes",
    cap: 30,
  },
  {
    label: "Aggressive",
    desc: "Up to 40% off · fill every empty seat",
    cap: 40,
  },
] as const;

export const VERIFY_METHODS: VerifyMethodInfo[] = [
  {
    id: "payone",
    label: "Payone Merchant ID",
    hint: "Already a Payone partner — no documents.",
    icon: CreditCard,
    badge: "Fastest",
    duration: 1400,
  },
  {
    id: "eid",
    label: "eID + Handelsregister",
    hint: "Personalausweis NFC + auto Handelsregister-Auszug.",
    icon: Landmark,
    badge: "Recommended",
    duration: 2200,
  },
  {
    id: "postident",
    label: "Postident",
    hint: "Verify at any Deutsche Post office (1–2 days).",
    icon: Building2,
    duration: 1800,
  },
];

export const VARIANTS: Variant[] = [
  {
    id: "mia",
    template: "intimate",
    persona: {
      initial: "M",
      label: "Mia · 28 · Stuttgart",
      subtitle: "Lunch break · slightly cold · 12 min free",
    },
    windows: ["afternoon", "lunch"],
    bg: "from-sky-200 via-rose-100 to-amber-50",
    ribbon: {
      label: "Just for you",
      gradient: "from-brand-500 to-brand-700",
      icon: Sparkles,
    },
    accent: {
      fg: "text-brand-600",
      bg: "bg-brand-50",
      border: "border-brand-200",
    },
    headline: "Cold outside?",
    sub: (n) => `Your ${n.toLowerCase()} is waiting at Café Müller.`,
    category: "Drinks",
    discount: 20,
    context: "11°C · 80m · quiet hour",
    cta: "Claim offer",
    timestamp: "now",
  },
  {
    id: "lukas",
    template: "scarcity",
    persona: {
      initial: "L",
      label: "Lukas · 21 · student",
      subtitle: "Heading home after class · hungry",
    },
    windows: ["late", "evening"],
    bg: "from-amber-200 via-orange-200 to-rose-200",
    ribbon: {
      label: "Last drop",
      gradient: "from-amber-500 to-orange-600",
      icon: Clock,
    },
    accent: {
      fg: "text-orange-500",
      bg: "bg-orange-50",
      border: "border-orange-200",
    },
    headline: "3 left tonight.",
    sub: (n) => `${n} half-off until 19:30. First come, first served.`,
    category: "Pastries",
    discount: 50,
    context: "Closes in 32 min · 220m",
    cta: "Reserve mine",
    timestamp: "2 min ago",
  },
  {
    id: "sarah",
    template: "discovery",
    persona: {
      initial: "S",
      label: "Sarah · 34 · tourist",
      subtitle: "Sunny stroll · curious about local",
    },
    windows: ["morning", "lunch"],
    bg: "from-emerald-100 via-sky-100 to-teal-100",
    ribbon: {
      label: "Local discovery",
      gradient: "from-emerald-500 to-teal-600",
      icon: MapPin,
    },
    accent: {
      fg: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
    headline: "A Stuttgart classic.",
    sub: (n) => `Try ${n.toLowerCase()} the way locals do.`,
    category: "Desserts",
    discount: 20,
    context: "21°C sunny · 4★ · 3 min walk",
    cta: "Save the seat",
    timestamp: "now",
  },
  {
    id: "ahmed",
    template: "utility",
    persona: {
      initial: "A",
      label: "Ahmed · 35 · commuter",
      subtitle: "Running late · raining · needs caffeine",
    },
    windows: ["morning"],
    bg: "from-slate-200 via-blue-100 to-indigo-100",
    ribbon: {
      label: "On your route",
      gradient: "from-slate-700 to-blue-700",
      icon: CloudDrizzle,
    },
    accent: {
      fg: "text-sky-300",
      bg: "bg-slate-800",
      border: "border-slate-700",
    },
    headline: "Raining at your stop.",
    sub: (n) => `${n} ready in 90 seconds. Pay-as-you-pass.`,
    category: "Drinks",
    discount: 15,
    context: "Light rain · 40m · skip the queue",
    cta: "Order ahead",
    timestamp: "now",
  },
  {
    id: "greta",
    template: "calm",
    persona: {
      initial: "G",
      label: "Greta · 62 · weekend walk",
      subtitle: "Afternoon with a friend · slow pace",
    },
    windows: ["afternoon", "evening"],
    bg: "from-purple-100 via-pink-100 to-amber-100",
    ribbon: {
      label: "Quiet hour",
      gradient: "from-purple-500 to-pink-600",
      icon: Sun,
    },
    accent: {
      fg: "text-purple-700",
      bg: "bg-purple-50",
      border: "border-purple-200",
    },
    headline: "Take a slow break.",
    sub: (n) => `${n} & a tea for two. Table by the window — saved.`,
    category: "Pastries",
    discount: 25,
    context: "Sunday · 16°C · low traffic",
    cta: "Book the table",
    timestamp: "1 min ago",
  },
];
