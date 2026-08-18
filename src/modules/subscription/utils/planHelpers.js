// src/modules/subscription/utils/planHelpers.js

/**
 * The SubscriptionPlan backend model has no explicit "isFeatured" flag —
 * only `hasFeaturedListing` (whether listings under this plan can be
 * featured), which is a different concept. Until the backend adds a real
 * flag (e.g. `isRecommended`), we derive "this is the highlighted plan"
 * from the plan name, matching the logic PlanCard already used.
 */
export function isPremiumPlan(plan) {
  const name = plan?.planName?.toLowerCase() || "";
  return name.includes("premium") || name.includes("prestige");
} 