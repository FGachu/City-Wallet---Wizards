"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

const STORAGE_KEY = "city-wallet:onboarding-complete";
const ONBOARDING_PATH = "/onboarding";

type OnboardingContextValue = {
  completed: boolean;
  hydrated: boolean;
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
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setCompleted(
      typeof window !== "undefined" &&
        window.localStorage.getItem(STORAGE_KEY) === "true"
    );
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!completed && pathname !== ONBOARDING_PATH) {
      router.replace(ONBOARDING_PATH);
    }
  }, [hydrated, completed, pathname, router]);

  const complete = useCallback(() => {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setCompleted(true);
  }, []);

  const reset = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setCompleted(false);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{ completed, hydrated, complete, reset }}
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
