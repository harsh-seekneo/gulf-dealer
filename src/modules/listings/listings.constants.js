export const LISTING_TABS = [
  {
    key: "all",
    label: "All",
    status: undefined,
  },
  {
    key: "active",
    label: "Active",
    status: "PUBLISHED",
  },
  {
    key: "pending",
    label: "Pending",
    status: "PENDING_REVIEW",
  },
  {
    key: "rejected",
    label: "Rejected",
    status: "REJECTED",
  },
  {
    key: "expired",
    label: "Expired",
    status: "EXPIRED",
  },
];

export const formatPrice = (price) =>
  `BHD ${Number(price || 0).toLocaleString()}`;