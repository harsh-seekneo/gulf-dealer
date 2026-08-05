const categoryPatterns = [
  { pattern: /heavy|equipment/i, subscriptionCategory: "HEAVY_EQUIPMENT" },
  { pattern: /commercial/i, subscriptionCategory: "COMMERCIAL_VEHICLES" },
  { pattern: /car|bike|motorbike|special number|carvaan|caravan|buggy|showroom|dealer/i, subscriptionCategory: "CARS_BIKES" },
];

export const mapCatalogCategoryToSubscriptionCategory = (categoryName = "") => {
  const match = categoryPatterns.find((item) => item.pattern.test(categoryName));
  return match?.subscriptionCategory || "CARS_BIKES";
};