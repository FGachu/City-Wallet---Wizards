import type { LucideIcon } from "lucide-react";

export type ScanState = "idle" | "scanning" | "done";

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
};

export type WindowId = "morning" | "lunch" | "afternoon" | "evening" | "late";

export type VerifyMethod = "payone" | "eid" | "postident";
export type VerifyStatus = "idle" | "verifying" | "verified" | "failed";

export type CardStatus = "locked" | "active" | "done";

export type Template =
  | "intimate"
  | "scarcity"
  | "discovery"
  | "utility"
  | "calm";

export type Variant = {
  id: string;
  template: Template;
  persona: { initial: string; label: string; subtitle: string };
  windows: WindowId[];
  bg: string;
  ribbon: { label: string; gradient: string; icon: LucideIcon };
  accent: { fg: string; bg: string; border: string };
  headline: string;
  sub: (item: string) => string;
  category: string;
  discount: number;
  context: string;
  cta: string;
  timestamp: string;
};

export type Offer = {
  variant: Variant;
  item: string;
  price: number;
  discount: number;
};

export type VerifyMethodInfo = {
  id: VerifyMethod;
  label: string;
  hint: string;
  icon: LucideIcon;
  badge?: string;
  duration: number;
};

export type TimeWindow = {
  id: WindowId;
  label: string;
  hint: string;
  icon: LucideIcon;
};
