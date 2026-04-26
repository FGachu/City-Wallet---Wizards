"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOnboarding } from "@/lib/onboarding-context";
import {
  navigationItems,
  type NavigationPath,
} from "@/lib/navigation-items";

export default function Sidebar() {
  const pathname = usePathname();
  const { completed, setLastVisitedPath } = useOnboarding();

  const handleNavigate = (href: NavigationPath) => {
    setLastVisitedPath(href);
  };

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
        {navigationItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          const content = (
            <>
              <Icon className="size-4" />
              <span>{item.label}</span>
              {!completed && item.href !== "/onboarding" && (
                <span className="ml-auto rounded-full border border-ink-200 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ink-400">
                  Setup
                </span>
              )}
            </>
          );

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => handleNavigate(item.href)}
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
