export type MerchantSettings = {
  venueName: string;
  address: string;
  payoutIban: string;
  payoneMerchantId: string;
  allowPushOffers: boolean;
  allowSmsFallback: boolean;
  privacyMode: "balanced" | "strict";
};

export const defaultMerchantSettings: MerchantSettings = {
  venueName: "Café Müller",
  address: "Königstraße 12, 70173 Stuttgart",
  payoutIban: "DE89 3704 0044 0532 0130 00",
  payoneMerchantId: "PAYONE-STU-0192",
  allowPushOffers: true,
  allowSmsFallback: false,
  privacyMode: "balanced",
};

export function parseMerchantSettings(input: unknown): MerchantSettings {
  if (!input || typeof input !== "object") return defaultMerchantSettings;

  const raw = input as Partial<MerchantSettings>;
  const privacyMode =
    raw.privacyMode === "strict" || raw.privacyMode === "balanced"
      ? raw.privacyMode
      : defaultMerchantSettings.privacyMode;

  return {
    venueName:
      typeof raw.venueName === "string" && raw.venueName.trim().length > 0
        ? raw.venueName
        : defaultMerchantSettings.venueName,
    address:
      typeof raw.address === "string" && raw.address.trim().length > 0
        ? raw.address
        : defaultMerchantSettings.address,
    payoutIban:
      typeof raw.payoutIban === "string" && raw.payoutIban.trim().length > 0
        ? raw.payoutIban
        : defaultMerchantSettings.payoutIban,
    payoneMerchantId:
      typeof raw.payoneMerchantId === "string" &&
      raw.payoneMerchantId.trim().length > 0
        ? raw.payoneMerchantId
        : defaultMerchantSettings.payoneMerchantId,
    allowPushOffers:
      typeof raw.allowPushOffers === "boolean"
        ? raw.allowPushOffers
        : defaultMerchantSettings.allowPushOffers,
    allowSmsFallback:
      typeof raw.allowSmsFallback === "boolean"
        ? raw.allowSmsFallback
        : defaultMerchantSettings.allowSmsFallback,
    privacyMode,
  };
}
