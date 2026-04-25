"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Activity,
  Tag,
  Settings,
  Sparkles,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboarding } from "@/lib/onboarding-context";

const items = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/onboarding", label: "Onboarding", icon: Wand2 },
  { href: "/products", label: "Products", icon: Package },
  { href: "/monitoring", label: "Monitoring", icon: Activity },
  { href: "/offers", label: "Live offers", icon: Tag },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { completed } = useOnboarding();

  return (
    <aside className="w-64 shrink-0 border-r border-ink-200 bg-white px-4 py-6 flex flex-col gap-8">
      <div className="px-2">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center shadow-sm">
            <Sparkles className="size-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">
              City Wallet
            </div>
            <div className="text-[11px] text-ink-500 leading-tight">
              Merchant Console
            </div>
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5">
        {items.map((item) => {
          const active = pathname === item.href;
          const isOnboarding = item.href === "/onboarding";
          const locked = !completed && !isOnboarding;
          const Icon = item.icon;

          const content = (
            <>
              <Icon className="size-4" />
              <span>{item.label}</span>
            </>
          );

          if (locked) {
            return (
              <span
                key={item.href}
                aria-disabled="true"
                title="Finish onboarding to unlock"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-300 cursor-not-allowed select-none"
              >
                {content}
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-brand-50 text-brand-700 font-medium"
                  : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
              )}
            >
              {content}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-ink-200 bg-gradient-to-br from-ink-50 to-white p-4">
        <div className="text-xs font-semibold text-ink-700 mb-1">
          Powered by DSV-Gruppe
        </div>
        <div className="text-[11px] text-ink-500 leading-relaxed">
          Generative offers built on Payone signals, weather and local context.
        </div>
      </div>
    </aside>
  );
}
