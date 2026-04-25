"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Check,
  Landmark,
  Loader2,
  Lock,
  MapPin,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VERIFY_METHODS } from "./data";
import type { VerifyMethod, VerifyMethodInfo, VerifyStatus } from "./types";

const inputCls =
  "w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500";

export function VerifyOwnership({
  method,
  setMethod,
  status,
  setStatus,
  name,
  address,
  merchantId,
  setMerchantId,
}: {
  method: VerifyMethod;
  setMethod: (m: VerifyMethod) => void;
  status: VerifyStatus;
  setStatus: (s: VerifyStatus) => void;
  name: string;
  address: string;
  merchantId: string;
  setMerchantId: (v: string) => void;
}) {
  const [iban, setIban] = useState("");

  const current = VERIFY_METHODS.find((m) => m.id === method)!;
  const canRun =
    status !== "verifying" &&
    status !== "verified" &&
    (method !== "payone" || (merchantId.length >= 6 && iban.length >= 4));

  const run = () => {
    setStatus("verifying");
    setTimeout(() => setStatus("verified"), current.duration);
  };

  if (status === "verified") {
    return (
      <VerifySuccess
        method={current}
        name={name || "Your venue"}
        address={address}
        onReset={() => setStatus("idle")}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {VERIFY_METHODS.map((m) => {
          const active = method === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMethod(m.id);
                setStatus("idle");
              }}
              className={cn(
                "rounded-xl border p-3 text-left transition relative",
                active
                  ? "border-brand-500 bg-brand-50/60 shadow-sm"
                  : "border-ink-200 hover:border-ink-300"
              )}
            >
              {m.badge && (
                <span
                  className={cn(
                    "absolute -top-2 right-2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full",
                    m.badge === "Recommended"
                      ? "bg-brand-500 text-white"
                      : "bg-emerald-500 text-white"
                  )}
                >
                  {m.badge}
                </span>
              )}
              <Icon
                className={cn(
                  "size-4 mb-2",
                  active ? "text-brand-500" : "text-ink-500"
                )}
              />
              <div
                className={cn(
                  "text-sm font-semibold leading-tight",
                  active ? "text-brand-700" : "text-ink-800"
                )}
              >
                {m.label}
              </div>
              <div className="text-[11px] text-ink-500 mt-1 leading-snug">
                {m.hint}
              </div>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={method}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="rounded-xl border border-ink-200 bg-ink-50/40 p-4"
        >
          {method === "payone" && (
            <PayoneForm
              merchantId={merchantId}
              setMerchantId={setMerchantId}
              iban={iban}
              setIban={setIban}
            />
          )}
          {method === "eid" && <EidPanel />}
          {method === "postident" && <PostidentPanel address={address} />}
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="text-[11px] text-ink-500 inline-flex items-center gap-1.5 leading-snug">
          <Lock className="size-3" />
          BaFin-compliant · GDPR · documents stay encrypted in DSV-Gruppe
          servers.
        </div>
        <button
          type="button"
          onClick={run}
          disabled={!canRun}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 text-sm font-semibold rounded-lg px-4 py-2.5 transition shrink-0",
            canRun
              ? "bg-brand-500 hover:bg-brand-600 text-white"
              : "bg-ink-100 text-ink-400 cursor-not-allowed"
          )}
        >
          {status === "verifying" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Verifying…
            </>
          ) : (
            <>
              <ShieldCheck className="size-4" />
              Verify ownership
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function PayoneForm({
  merchantId,
  setMerchantId,
  iban,
  setIban,
}: {
  merchantId: string;
  setMerchantId: (v: string) => void;
  iban: string;
  setIban: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1.6fr_1fr] gap-3">
      <label className="block">
        <div className="text-[11px] uppercase tracking-wider text-ink-500 mb-1">
          Payone Merchant ID
        </div>
        <input
          value={merchantId}
          onChange={(e) => setMerchantId(e.target.value)}
          placeholder="DE-1234567"
          className={cn(inputCls, "font-mono")}
        />
      </label>
      <label className="block">
        <div className="text-[11px] uppercase tracking-wider text-ink-500 mb-1">
          IBAN — last 4 digits
        </div>
        <input
          value={iban}
          onChange={(e) => setIban(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="4218"
          inputMode="numeric"
          className={cn(inputCls, "font-mono")}
        />
      </label>
      <div className="sm:col-span-2 text-[11px] text-ink-500 leading-relaxed">
        We match against your Payone KYC record and confirm a €0.01 micro-deposit
        on the registered IBAN. Approved in seconds.
      </div>
    </div>
  );
}

function EidPanel() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-lg border border-ink-200 bg-white p-3">
        <span className="size-9 rounded-lg bg-brand-50 border border-brand-100 grid place-items-center shrink-0">
          <BadgeCheck className="size-4 text-brand-600" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium leading-tight">
            Personalausweis NFC scan
          </div>
          <div className="text-[11px] text-ink-500 mt-0.5">
            Open AusweisApp on your phone, hold your ID against the back of the
            device.
          </div>
        </div>
        <span className="text-[11px] text-ink-400">Step 1</span>
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-ink-200 bg-white p-3">
        <span className="size-9 rounded-lg bg-brand-50 border border-brand-100 grid place-items-center shrink-0">
          <Landmark className="size-4 text-brand-600" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium leading-tight">
            Handelsregister-Auszug
          </div>
          <div className="text-[11px] text-ink-500 mt-0.5">
            We auto-pull your HRB extract and confirm you are the registered
            Geschäftsführer or Inhaber.
          </div>
        </div>
        <span className="text-[11px] text-ink-400">Auto</span>
      </div>
    </div>
  );
}

function PostidentPanel({ address }: { address: string }) {
  return (
    <div className="text-xs text-ink-600 leading-relaxed space-y-2">
      <p>
        Best for <strong>Einzelunternehmer</strong> without Handelsregister
        entry, or merchants without an NFC-enabled ID. We&apos;ll generate a
        Postident coupon and email it to you.
      </p>
      <p className="text-ink-500">
        Bring your ID + the coupon to any <strong>Deutsche Post</strong> branch.
        Confirmation lands in 1–2 business days.
      </p>
      {address && (
        <div className="text-[11px] text-ink-500 inline-flex items-center gap-1 mt-1">
          <MapPin className="size-3" />
          Coupon mailed to: {address}
        </div>
      )}
    </div>
  );
}

function VerifySuccess({
  method,
  name,
  address,
  onReset,
}: {
  method: VerifyMethodInfo;
  name: string;
  address: string;
  onReset: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 flex items-start gap-3"
    >
      <span className="size-10 rounded-full bg-emerald-500 text-white grid place-items-center shrink-0 shadow-sm">
        <BadgeCheck className="size-5" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-ink-900">
          Ownership verified
        </div>
        <div className="text-xs text-ink-600 mt-0.5">
          {name}
          {address && <> · {address}</>}
        </div>
        <div className="text-[11px] text-emerald-700 mt-1.5 inline-flex items-center gap-1">
          <Check className="size-3" />
          Confirmed via {method.label}
        </div>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="text-[11px] text-ink-500 hover:text-ink-900 inline-flex items-center gap-1 shrink-0"
      >
        <RefreshCw className="size-3" />
        Re-verify
      </button>
    </motion.div>
  );
}
