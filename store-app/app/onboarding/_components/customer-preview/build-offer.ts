import { AGGRESSIVENESS, VARIANTS } from "../data";
import type { MenuItem, Offer, Variant, WindowId } from "../types";

export function buildOffer(
  items: MenuItem[],
  aggressiveness: number,
  windows: WindowId[],
  index: number
): { offer: Offer | null; variant: Variant | null; pool: Variant[] } {
  if (items.length === 0)
    return { offer: null, variant: null, pool: VARIANTS };

  const filtered = VARIANTS.filter((v) =>
    v.windows.some((w) => windows.includes(w))
  );
  const pool = filtered.length > 0 ? filtered : VARIANTS;
  const variant = pool[((index % pool.length) + pool.length) % pool.length];
  const cap = AGGRESSIVENESS[aggressiveness].cap;

  const candidates = items.filter((i) => i.category === variant.category);
  const itemPool = candidates.length > 0 ? candidates : items;
  const itemIndex =
    Math.floor(index / Math.max(pool.length, 1)) % itemPool.length;
  const item = itemPool[itemIndex];

  return {
    pool,
    variant,
    offer: {
      variant,
      item: item.name,
      price: item.price,
      discount: Math.min(variant.discount, cap),
    },
  };
}
