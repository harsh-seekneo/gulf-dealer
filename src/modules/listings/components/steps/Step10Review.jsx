"use client";

import { useState } from "react";
import { Video } from "lucide-react";

import { useBulkVehicleWizard } from "../../context/BulkVehicleWizardContext";
import {
  formatServicePrice,
  getServiceCountryCurrencyByName,
} from "../../config/gulfLocations.config";
import WizardFooterNav from "../WizardFooterNav";
import { getListingCardMeta, getListingCardTitle } from "../../../../utils/listingCardMeta";
import ListingPreviewCard from "../../../../utils/ListingPreviewCard";

const formatPrice = (value, currency) =>
  `${currency} ${Number(value || 0).toFixed(2)}`;

const Step10Review = ({ useWizardHook = useBulkVehicleWizard }) => {
  const { listing, isSaving, goPrevious, saveDraft, submitListing } =
    useWizardHook();

  const [isAccepted, setIsAccepted] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const vehicleInfo = listing?.vehicleInfo || {};
  const pricing = listing?.pricing || {};
  const planSnapshot = listing?.planLimitsSnapshot;
  const addOns = listing?.addOns || [];
  const fallbackAddOnCurrency = addOns.find(
    (addOn) => addOn.currencySnapshot || addOn.currency,
  );
  const selectedCurrency =
    planSnapshot?.currencySnapshot ||
    pricing.currency ||
    fallbackAddOnCurrency?.currencySnapshot ||
    fallbackAddOnCurrency?.currency ||
    getServiceCountryCurrencyByName(listing?.location?.country);
  const getAddOnCurrency = (addOn) =>
    addOn.currencySnapshot || addOn.currency || selectedCurrency;
  const corePlanBaseAmount = Number(
    planSnapshot?.basePriceSnapshot ?? planSnapshot?.priceSnapshot ?? 0,
  );
  const corePlanTaxAmount = Number(planSnapshot?.vatAmountSnapshot || 0);
  const corePlanAmount = Number(
    planSnapshot?.finalPriceSnapshot ?? corePlanBaseAmount + corePlanTaxAmount,
  );
  const corePlanTaxLabel = `${planSnapshot?.taxNameSnapshot || "VAT"} (${Number(
    planSnapshot?.vatPercentageSnapshot || 0,
  )}%)`;
  const getAddOnBaseAmount = (addOn) =>
    Number(addOn.basePriceSnapshot ?? addOn.priceSnapshot ?? 0);
  const getAddOnTaxAmount = (addOn) => Number(addOn.vatAmountSnapshot || 0);
  const getAddOnTotalAmount = (addOn) =>
    Number(
      addOn.finalPriceSnapshot ??
        addOn.priceSnapshot ??
        getAddOnBaseAmount(addOn) + getAddOnTaxAmount(addOn),
    );
  const addOnsAmount = addOns.reduce(
    (sum, addOn) => sum + getAddOnTotalAmount(addOn),
    0,
  );

  const formType = listing?.category?.vehicleFormType || "CAR";
  const isSpecialNumber = formType === "SPECIAL_NUMBER";

  const accuracyLabel = isSpecialNumber
    ? "plate information"
    : "vehicle information";

  const previewLocation = [listing?.location?.city, listing?.location?.country]
    .filter(Boolean)
    .join(", ");
  const previewMeta = getListingCardMeta(listing || {});
  const previewTitle =
    getListingCardTitle(listing || {}) ||
    vehicleInfo.title ||
    "Untitled Listing";
  const previewSellerName =
    listing?.dealerName ||
    listing?.dealer?.businessName ||
    listing?.dealer?.business?.name ||
    listing?.owner?.dealerProfile?.businessName ||
    listing?.seller?.businessName ||
    listing?.seller?.companyName ||
    listing?.seller?.name ||
    vehicleInfo.sellerName ||
    "Dealer";
  const hasAddOn = (keyword) =>
    addOns.some((addOn) =>
      String(addOn.planNameSnapshot || "")
        .toLowerCase()
        .includes(keyword),
    );
  const [previewPublishedAt] = useState(() => new Date().toISOString());

  const handleSubmit = async () => {
    if (!isAccepted) {
      setShowValidation(true);
      return;
    }

    setSubmitError("");

    try {
      await submitListing();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to submit your listing";
      setSubmitError(message);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-950">Review &amp; Submit</h2>
      <p className="mt-1 text-sm text-slate-500">
        Review your listing before publishing. You can edit any section.
      </p>

      <div className="relative mx-auto mt-5 w-full max-w-[260px]">
        <ListingPreviewCard
          image={listing?.media?.featuredImage?.url}
          isFeatured={hasAddOn("feature")}
          isBumpedToTop={hasAddOn("bump")}
          title={previewTitle}
          price={
            pricing.price
              ? formatServicePrice(pricing.price, {
                  currency: selectedCurrency,
                  listingType: listing?.listingType,
                  rentalPrices: pricing.rentalPrices,
                })
              : ""
          }
          meta={previewMeta}
          location={previewLocation || "Location not shared"}
          seller={previewSellerName}
          sellerVerified
          views="0"
          publishedAt={previewPublishedAt}
        />

        {listing?.media?.video ? (
          <span className="pointer-events-none absolute right-2 top-2 z-20 flex items-center gap-1 rounded-full bg-slate-950/70 px-2 py-0.5 text-[10px] font-medium text-white sm:right-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs">
            <Video size={12} />
            Video
          </span>
        ) : null}
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
        <div className="p-4">
          <div className="mt-4 border-t border-slate-100 pt-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Price Plan: {planSnapshot?.planNameSnapshot || "—"}
                </p>
                <p className="text-xs text-slate-500">
                  {planSnapshot?.listingDurationSnapshot || "—"}
                </p>
              </div>
              <p className="shrink-0 text-sm font-bold text-slate-900">
                Covered · {formatPrice(corePlanBaseAmount, selectedCurrency)}
              </p>
            </div>

            {planSnapshot?.vatEnabledSnapshot ? (
              <div className="mt-3 flex items-start justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2 text-xs">
                <span className="font-semibold text-slate-600">
                  {corePlanTaxLabel}
                </span>
                <span className="shrink-0 font-bold text-slate-900">
                  {formatPrice(corePlanTaxAmount, selectedCurrency)}
                </span>
              </div>
            ) : null}

            {addOns.length ? (
              <div className="mt-3 space-y-2">
                {addOns.map((addOn) => (
                  <div
                    key={
                      addOn.subscriptionId ||
                      addOn.planId ||
                      addOn.planNameSnapshot
                    }
                    className="flex flex-wrap items-start justify-between gap-4 rounded-lg bg-slate-50 px-3 py-2 text-xs"
                  >
                    <span className="font-semibold text-slate-600">
                      Add-on: {addOn.planNameSnapshot}
                    </span>
                    <span className="shrink-0 font-bold text-slate-900">
                      {addOn.subscriptionId ? "Covered · " : ""}
                      {formatPrice(
                        getAddOnBaseAmount(addOn),
                        getAddOnCurrency(addOn),
                      )}
                    </span>
                    {addOn.vatEnabledSnapshot ? (
                      <span className="basis-full text-right text-[11px] font-semibold text-slate-500">
                        {addOn.taxNameSnapshot || "VAT"} (
                        {Number(addOn.vatPercentageSnapshot || 0)}%):{" "}
                        {formatPrice(
                          getAddOnTaxAmount(addOn),
                          getAddOnCurrency(addOn),
                        )}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs font-medium text-slate-400">
                Add-ons: None selected
              </p>
            )}

            <div className="mt-3 flex items-center justify-between gap-4 rounded-lg bg-blue-50 px-3 py-2">
              <span className="text-sm font-bold text-slate-900">
                Total Amount Paid
              </span>
              <span className="text-sm font-black text-blue-700">
                {formatPrice(corePlanAmount + addOnsAmount, selectedCurrency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {submitError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <div
        className={`mt-4 rounded-xl border p-3 transition-all duration-200 ${
          showValidation && !isAccepted
            ? "border-red-400 ring-2 ring-red-400 ring-offset-1"
            : "border-slate-200"
        }`}
      >
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={isAccepted}
            onChange={(e) => {
              setIsAccepted(e.target.checked);
              setShowValidation(false);
            }}
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-600">
            I confirm that the {accuracyLabel} is accurate and I accept the{" "}
            <a
              href="/terms-and-conditions"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-blue-600 hover:underline"
            >
              Terms &amp; Conditions
            </a>{" "}
            and{" "}
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-blue-600 hover:underline"
            >
              Listing Policy
            </a>
            .
          </span>
        </label>
      </div>

      {showValidation && !isAccepted && (
        <p className="mt-2 text-xs font-medium text-red-600">
          Please accept the terms to submit your listing
        </p>
      )}

      <WizardFooterNav
        onPrevious={goPrevious}
        onSaveDraft={saveDraft}
        onNext={handleSubmit}
        isSaving={isSaving}
        nextLabel="Submit Listing"
      />
    </div>
  );
};

export default Step10Review;
