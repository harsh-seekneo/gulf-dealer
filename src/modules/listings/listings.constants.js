export const LISTING_TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "pending", label: "Pending" },
  { key: "rejected", label: "Rejected" },
  { key: "sold", label: "Sold" },
];

export const formatPrice = (price) =>
  `BHD ${Number(price || 0).toLocaleString()}`;