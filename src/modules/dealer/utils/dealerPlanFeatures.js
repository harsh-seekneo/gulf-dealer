export const getDealerPlanFeatures = (plan) => {
  const businessFeatures = plan?.businessFeatures || {};
  const legacyFeatures = plan?.features || {};

  return {
    websiteLink: Boolean(
      businessFeatures.websiteLink ?? legacyFeatures.websiteLink ?? plan?.websiteLink
    ),
    socialMediaLinks: Boolean(
      businessFeatures.socialMediaLinks ??
        legacyFeatures.socialMediaLinks ??
        plan?.socialMediaLinks
    ),
  };
};

export const getSelectedPlanFeatures = (draft, plans = []) => {
  const selectedPlanId =
    draft?.selectedPlan?.plan || draft?.selectedPlan?._id || draft?.plan?.id;

  const selectedPlan = plans.find(
    (plan) => String(plan?._id || "") === String(selectedPlanId || "")
  );

  return getDealerPlanFeatures(selectedPlan || draft?.plan || draft?.selectedPlan);
};
