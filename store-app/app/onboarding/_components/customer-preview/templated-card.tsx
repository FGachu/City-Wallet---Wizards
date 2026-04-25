"use client";

import { motion } from "framer-motion";
import type { Offer, Template, Variant } from "../types";
import { EASE } from "./constants";
import { CalmCard } from "./templates/calm-card";
import { DiscoveryCard } from "./templates/discovery-card";
import { IntimateCard } from "./templates/intimate-card";
import { ScarcityCard } from "./templates/scarcity-card";
import { UtilityCard } from "./templates/utility-card";

const TEMPLATES: Record<
  Template,
  React.ComponentType<{ variant: Variant; offer: Offer }>
> = {
  intimate: IntimateCard,
  scarcity: ScarcityCard,
  discovery: DiscoveryCard,
  utility: UtilityCard,
  calm: CalmCard,
};

export function TemplatedCard({
  variant,
  offer,
}: {
  variant: Variant;
  offer: Offer;
}) {
  const Component = TEMPLATES[variant.template] ?? IntimateCard;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.985 }}
      transition={{ duration: 0.65, ease: EASE }}
    >
      <Component variant={variant} offer={offer} />
    </motion.div>
  );
}
