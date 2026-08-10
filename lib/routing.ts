import type { IntentValue } from "./intents";

/**
 * Lead routing.
 *
 * Deliberately a scaffold. Every lead is stamped with the tier it was captured
 * under and, where the tier names one, the destination it belongs to — so the
 * day volume justifies real distribution, that becomes a change to this file
 * (or to LEAD_ROUTING_TIER) rather than a schema migration and a backfill of
 * rows whose provenance nobody recorded.
 *
 * Nothing here contacts an external service. Routing is a stamp, not a send.
 */

export type RoutingTier = "tier1_founding" | "tier2_panel" | "tier3_auction";

const DEFAULT_TIER: RoutingTier = "tier1_founding";

const TIERS: readonly RoutingTier[] = [
  "tier1_founding",
  "tier2_panel",
  "tier3_auction",
];

function isTier(value: unknown): value is RoutingTier {
  return typeof value === "string" && TIERS.includes(value as RoutingTier);
}

/**
 * The tier in force. Set LEAD_ROUTING_TIER in the environment to move the
 * whole site to a new tier without a deploy; an unrecognised value falls back
 * rather than stamping something the column's readers won't understand.
 */
export function currentTier(): RoutingTier {
  const configured = process.env.LEAD_ROUTING_TIER;
  if (configured && !isTier(configured)) {
    console.warn(`[routing] ignoring unknown LEAD_ROUTING_TIER "${configured}"`);
  }
  return isTier(configured) ? configured : DEFAULT_TIER;
}

export interface Routing {
  routing_tier: RoutingTier;
  /** Who the lead belongs to, or null when the tier doesn't assign one. */
  routed_to: string | null;
  status: "new";
}

/**
 * In tier 1 every lead goes to the founding panel — one destination, recorded
 * by name so later tiers can be told apart from it in the same table. Later
 * tiers will assign per intent; the shape is already here for them.
 */
const TIER1_DESTINATION = "founding_panel";

export function routeLead(intent: IntentValue): Routing {
  const tier = currentTier();

  switch (tier) {
    case "tier1_founding":
      return {
        routing_tier: tier,
        routed_to: TIER1_DESTINATION,
        status: "new",
      };

    // Not live yet: stamped, unassigned, and picked up by whoever works the
    // queue. Assignment lands here when there is a panel to assign to.
    case "tier2_panel":
    case "tier3_auction":
    default:
      return { routing_tier: tier, routed_to: null, status: "new" };
  }
}
