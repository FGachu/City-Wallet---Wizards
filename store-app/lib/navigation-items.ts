import {
  Activity,
  LayoutDashboard,
  Package,
  Settings,
  Tag,
  Wand2,
} from "lucide-react";

export const navigationItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/onboarding", label: "Onboarding", icon: Wand2 },
  { href: "/products", label: "Products", icon: Package },
  { href: "/monitoring", label: "Monitoring", icon: Activity },
  { href: "/offers", label: "Live offers", icon: Tag },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export type NavigationPath = (typeof navigationItems)[number]["href"];

export function isNavigationPath(pathname: string): pathname is NavigationPath {
  return navigationItems.some((item) => item.href === pathname);
}
