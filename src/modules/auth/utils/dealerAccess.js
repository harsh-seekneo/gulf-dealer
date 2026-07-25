const approvedDealerStatuses = ["APPROVED", "ACTIVE"];

export const normalizeDealerStatus = (status) =>
  String(status || "").trim().toUpperCase();

export const isDealerUser = (user, dealerStatus) => {
  if (!user) {
    return false;
  }

  const accountType = String(user.accountType || "").toUpperCase();
  const normalizedStatus = normalizeDealerStatus(dealerStatus);
  const hasDealerReference = Boolean(
    user.dealer ||
      user.dealerProfile?.dealer ||
      user.dealerProfile?.businessName,
  );

  if (accountType !== "DEALER" && !hasDealerReference) {
    return false;
  }

  if (!dealerStatus) {
    return accountType === "DEALER" || hasDealerReference;
  }

  return approvedDealerStatuses.includes(normalizedStatus);
};
