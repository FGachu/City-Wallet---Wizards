"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Card, CardHead } from "./_components/card";
import {
  buildOffer,
  CustomerPreview,
} from "./_components/customer-preview";
import { IdentityCard } from "./_components/identity-card";
import {
  ComingSoonUpload,
  InventoryPreview,
} from "./_components/menu-capture";
import { PrivacyCard } from "./_components/privacy-card";
import { QuietWindowsPanel } from "./_components/quiet-windows-panel";
import { AggressivenessSlider } from "./_components/rules-config";
import { VerifyOwnership } from "./_components/verify-ownership";
import type {
  CardStatus,
  MenuItem,
  VerifyMethod,
  VerifyStatus,
  WindowId,
} from "./_components/types";
import { motion } from "framer-motion";
import { useOnboarding } from "@/lib/onboarding-context";

export default function OnboardingPage() {
  const { complete } = useOnboarding();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [menuMode, setMenuMode] = useState<"idle" | "manual">("idle");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [aggressiveness, setAggressiveness] = useState(1);
  const [windows, setWindows] = useState<WindowId[]>(["afternoon"]);
  const [live, setLive] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const [verifyMethod, setVerifyMethod] = useState<VerifyMethod>("payone");
  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>("idle");
  const [payoneMerchantId, setPayoneMerchantId] = useState("");

  const startManual = () => {
    setMenuMode("manual");
    setItems([]);
  };

  const { offer, variant, pool } = useMemo(
    () => buildOffer(items, aggressiveness, windows, previewIndex),
    [items, aggressiveness, windows, previewIndex]
  );

  useEffect(() => {
    if (items.length === 0) return;
    const id = setInterval(() => setPreviewIndex((i) => i + 1), 8000);
    return () => clearInterval(id);
  }, [items.length]);

  useEffect(() => {
    if (verifyStatus === "verified") complete();
  }, [verifyStatus, complete]);

  const totalRevenue = items.reduce((acc, i) => acc + i.price, 0);
  const avgPrice = items.length ? totalRevenue / items.length : 0;

  const menuReady = items.length > 0;
  const menuStatus: CardStatus = menuReady ? "done" : "active";
  const stepStatus = (done: boolean): CardStatus =>
    !menuReady ? "locked" : done ? "done" : "active";

  return (
    <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 pb-12">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-ink-500 font-semibold">
            <span className="size-1.5 rounded-full bg-brand-500" />
            Onboarding · 30 seconds
          </div>
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight mt-1.5">
            From menu to live offers
          </h1>
          <p className="text-sm text-ink-500 mt-1.5 max-w-xl leading-relaxed">
            Add your menu, set the rules, go live. The AI handles the rest —
            generating the right offer for the right person at the right minute.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_400px] gap-6 lg:gap-8 items-start">
        <div className="space-y-6 min-w-0">
          <IdentityCard
            name={name}
            setName={setName}
            address={address}
            setAddress={setAddress}
          />

          <Card status={menuStatus}>
            <CardHead
              step="1"
              title="Add your menu"
              hint="AI-powered menu scanning is on its way. For now, add your items manually."
              status={menuStatus}
            />
            <AnimatePresence mode="wait">
              {menuMode === "idle" && (
                <motion.div
                  key="coming-soon"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  <ComingSoonUpload onManual={startManual} />
                </motion.div>
              )}
              {menuMode === "manual" && (
                <motion.div
                  key="manual"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22 }}
                >
                  <InventoryPreview
                    items={items}
                    setItems={setItems}
                    onRescan={() => setMenuMode("idle")}
                    avgPrice={avgPrice}
                    manualMode
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          <Card status={stepStatus(verifyStatus === "verified")}>
            <CardHead
              step="2"
              title="Tune the rules"
              hint="Tell the AI how aggressive to go and when your floor is empty. We do the rest."
              status={stepStatus(verifyStatus === "verified")}
            />
            <div className="space-y-7">
              <AggressivenessSlider
                value={aggressiveness}
                onChange={setAggressiveness}
              />
              <QuietWindowsPanel
                merchantId={payoneMerchantId}
                setMerchantId={setPayoneMerchantId}
                windows={windows}
                setWindows={setWindows}
              />
            </div>
          </Card>

          <Card status={stepStatus(verifyStatus === "verified")}>
            <CardHead
              step="3"
              title="Verify ownership"
              hint="Last step — prove you run this venue. Required before offers go live."
              status={stepStatus(verifyStatus === "verified")}
            />
            <VerifyOwnership
              method={verifyMethod}
              setMethod={setVerifyMethod}
              status={verifyStatus}
              setStatus={setVerifyStatus}
              name={name}
              address={address}
              merchantId={payoneMerchantId}
              setMerchantId={setPayoneMerchantId}
            />
          </Card>
        </div>

        <div className="xl:sticky xl:top-6 space-y-4">
          <CustomerPreview
            offer={offer}
            variant={variant}
            pool={pool}
            index={previewIndex}
            onSelect={setPreviewIndex}
            live={live}
            empty={items.length === 0}
          />
          <PrivacyCard />
        </div>
      </div>
    </div>
  );
}
