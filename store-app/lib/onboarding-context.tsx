"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { isNavigationPath, type NavigationPath } from "@/lib/navigation-items";

const STORAGE_KEY = "city-wallet:onboarding-complete";
const DEFAULT_PATH: NavigationPath = "/";

type OnboardingContextValue = {
  completed: boolean;
  hydrated: boolean;
  lastVisitedPath: NavigationPath;
  setLastVisitedPath: (path: NavigationPath) => void;
  complete: () => void;
  reset: () => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [completed, setCompleted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [lastVisitedPath, setLastVisitedPathState] =
    useState<NavigationPath>(DEFAULT_PATH);
  const pathname = usePathname();

  const syncConsoleState = useCallback(
    async (payload: {
      onboardingComplete?: boolean;
      lastVisitedPath?: NavigationPath;
    }) => {
      await fetch("/api/console-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    },
    []
  );

  useEffect(() => {
    const hydrate = async () => {
      const localComplete =
        typeof window !== "undefined" &&
        window.localStorage.getItem(STORAGE_KEY) === "true";

      try {
        const response = await fetch("/api/console-state", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load console state");
        const data = (await response.json()) as {
          onboardingComplete?: boolean;
          lastVisitedPath?: string;
        };

        const onboardingComplete = Boolean(data.onboardingComplete ?? localComplete);
        const serverPath = data.lastVisitedPath ?? DEFAULT_PATH;
        const resolvedPath = isNavigationPath(serverPath) ? serverPath : DEFAULT_PATH;

        setCompleted(onboardingComplete);
        setLastVisitedPathState(resolvedPath);
        window.localStorage.setItem(STORAGE_KEY, String(onboardingComplete));
      } catch {
        setCompleted(localComplete);
      } finally {
        setHydrated(true);
      }
    };

    hydrate();
  }, []);

  const setLastVisitedPath = useCallback(
    (path: NavigationPath) => {
      setLastVisitedPathState(path);
      syncConsoleState({ lastVisitedPath: path }).catch(() => {
        // Keep navigation responsive even if persistence fails.
      });
    },
    [syncConsoleState]
  );

  useEffect(() => {
    if (!hydrated) return;
    if (!pathname || !isNavigationPath(pathname)) return;
    if (pathname === lastVisitedPath) return;
    setLastVisitedPath(pathname);
  }, [hydrated, pathname, lastVisitedPath, setLastVisitedPath]);

  const complete = useCallback(() => {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setCompleted(true);
    syncConsoleState({ onboardingComplete: true }).catch(() => {
      // Local state remains source of truth when offline.
    });
  }, [syncConsoleState]);

  const reset = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setCompleted(false);
    setLastVisitedPathState(DEFAULT_PATH);
    syncConsoleState({
      onboardingComplete: false,
      lastVisitedPath: DEFAULT_PATH,
    }).catch(() => {
      // Local reset should still work without network.
    });
  }, [syncConsoleState]);

  return (
    <OnboardingContext.Provider
      value={{
        completed,
        hydrated,
        lastVisitedPath,
        setLastVisitedPath,
        complete,
        reset,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return ctx;
}
