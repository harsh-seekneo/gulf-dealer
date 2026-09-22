"use client";

import { useRef, useState } from "react";

import { useBulkVehicleWizard } from "../../context/BulkVehicleWizardContext";
import { getServiceCountryCurrencyByName, RENTAL_PERIODS } from "../../config/gulfLocations.config";
import FormField from "../FormField";
import ToggleSwitch from "../ToggleSwitch";
import WizardFooterNav from "../WizardFooterNav";
import { scrollElementIntoWizardView } from "../../utils/wizardScroll";

const Step9Pricing = ({ useWizardHook = useBulkVehicleWizard }) => {
  const { listing, isSaving, saveStep, goPrevious, saveDraft } =
    useWizardHook();

  const existingPricing = listing?.pricing || {};
  const selectedCurrency =
    existingPricing.currency ||
    getServiceCountryCurrencyByName(listing?.location?.country);
  const listingType = listing?.listingType;
  const isBulkListing = Boolean(listing?.isBulkListing);
  const isSpecialNumber = listing?.category?.vehicleFormType === "SPECIAL_NUMBER";
  const accuracyLabel = isSpecialNumber ? "plate information" : "vehicle information";

  const [price, setPrice] = useState(
    existingPricing.price !== null && existingPricing.price !== undefined
      ? String(existingPricing.price)
      : ""
  );
  const [selectedRentalPeriods, setSelectedRentalPeriods] = useState(() =>
    RENTAL_PERIODS.filter(
      ({ key }) => Number(existingPricing.rentalPrices?.[key]) > 0
    ).map(({ key }) => key).concat(
      listingType === "RENT" &&
        !RENTAL_PERIODS.some(({ key }) => Number(existingPricing.rentalPrices?.[key]) > 0) &&
        Number(existingPricing.price) > 0
        ? ["daily"]
        : []
    )
  );
  const [rentalPrices, setRentalPrices] = useState(() =>
    RENTAL_PERIODS.reduce((result, { key }) => {
      result[key] =
        existingPricing.rentalPrices?.[key] !== null &&
        existingPricing.rentalPrices?.[key] !== undefined
          ? String(existingPricing.rentalPrices[key])
          : key === "daily" && listingType === "RENT" && Number(existingPricing.price) > 0
            ? String(existingPricing.price)
          : "";
      return result;
    }, {})
  );
  const [isNegotiable, setIsNegotiable] = useState(existingPricing.isNegotiable ?? false);
  const [error, setError] = useState("");
  const [isAccepted, setIsAccepted] = useState(false);
  const [acceptanceError, setAcceptanceError] = useState("");
  const priceFieldRef = useRef(null);
  const acceptanceFieldRef = useRef(null);

  const handlePriceChange = (value) => {
    if (value === "" || /^\d*\.?\d{0,3}$/.test(value)) {
      setPrice(value);
      setError("");
    }
  };

  const handleRentalPeriodToggle = (period) => {
    setSelectedRentalPeriods((current) =>
      current.includes(period)
        ? current.filter((item) => item !== period)
        : [...current, period]
    );
    setError("");
  };

  const handleRentalPriceChange = (period, value) => {
    if (value === "" || /^\d*\.?\d{0,3}$/.test(value)) {
      setRentalPrices((current) => ({ ...current, [period]: value }));
      setError("");
    }
  };

  const handleNext = async () => {
    if (listingType === "RENT") {
      if (!selectedRentalPeriods.length) {
        setError("Please select at least one rental period");
        scrollElementIntoWizardView(priceFieldRef.current);
        return;
      }

      const nextRentalPrices = selectedRentalPeriods.reduce((result, period) => {
        const numericPrice = Number(rentalPrices[period]);
        if (Number.isFinite(numericPrice) && numericPrice > 0) {
          result[period] = numericPrice;
        }
        return result;
      }, {});

      if (Object.keys(nextRentalPrices).length !== selectedRentalPeriods.length) {
        setError("Please enter a valid price for each selected rental period");
        scrollElementIntoWizardView(priceFieldRef.current);
        return;
      }

      if (isBulkListing && !isAccepted) {
        setAcceptanceError("Please accept the terms to submit this bulk listing");
        scrollElementIntoWizardView(acceptanceFieldRef.current);
        return;
      }

      await saveStep(9, {
        price: Object.values(nextRentalPrices)[0],
        rentalPrices: nextRentalPrices,
        currency: selectedCurrency,
        isNegotiable,
      });
      return;
    }

    const numericPrice = Number(price);

    if (!price || Number.isNaN(numericPrice) || numericPrice <= 0) {
      setError("Please enter a valid price");
      scrollElementIntoWizardView(priceFieldRef.current);
      return;
    }

    if (isBulkListing && !isAccepted) {
      setAcceptanceError("Please accept the terms to submit this bulk listing");
      scrollElementIntoWizardView(acceptanceFieldRef.current);
      return;
    }

    await saveStep(9, {
      price: numericPrice,
      rentalPrices: {},
      currency: selectedCurrency,
      isNegotiable,
    });
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-950">Pricing</h2>
      <p className="mt-1 text-sm text-slate-500">
        Set a competitive price to attract serious buyers.
      </p>

      <div ref={priceFieldRef} className="mt-5">
        {listingType === "RENT" ? (
          <FormField label="Rental Period" required error={error}>
            <div className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-3">
                {RENTAL_PERIODS.map(({ key, label }) => {
                  const isSelected = selectedRentalPeriods.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleRentalPeriodToggle(key)}
                      className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                        isSelected
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-300 text-slate-600 hover:border-blue-300"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {selectedRentalPeriods.map((period) => {
                const option = RENTAL_PERIODS.find((item) => item.key === period);
                return (
                  <div key={period}>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      {option.label} Price ({selectedCurrency})
                    </label>
                    <div className="flex h-11 items-center overflow-hidden rounded-lg border border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                      <span className="border-r border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-500">
                        {selectedCurrency}
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={rentalPrices[period]}
                        onChange={(e) => handleRentalPriceChange(period, e.target.value)}
                        placeholder="0.000"
                        className="h-full flex-1 border-0 px-3 text-sm font-semibold text-blue-600 outline-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </FormField>
        ) : (
          <FormField label={`Listing Price (${selectedCurrency})`} required error={error}>
            <div
              className={`flex h-11 items-center overflow-hidden rounded-lg border ${
                error
                  ? "border-red-400 ring-2 ring-red-400 ring-offset-1"
                  : "border-slate-300"
              } focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100`}
            >
              <span className="border-r border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-500">
                {selectedCurrency}
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(e) => handlePriceChange(e.target.value)}
                placeholder="0.000"
                className="h-full flex-1 border-0 px-3 text-sm font-semibold text-blue-600 outline-none"
              />
            </div>
          </FormField>
        )}
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 px-4">
        <ToggleSwitch
          label="Price Negotiable"
          description="Buyers can negotiate the listed price"
          checked={isNegotiable}
          onChange={setIsNegotiable}
        />
      </div>

      {isBulkListing && (
        <div
          ref={acceptanceFieldRef}
          className={`mt-5 rounded-xl border p-3 transition-all duration-200 ${
            acceptanceError ? "border-red-400 ring-2 ring-red-400 ring-offset-1" : "border-slate-200"
          }`}
        >
          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={isAccepted}
              onChange={(e) => {
                setIsAccepted(e.target.checked);
                setAcceptanceError("");
              }}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-600">
              I confirm that the {accuracyLabel} is accurate and I accept the{" "}
              <a href="/terms-and-conditions" target="_blank" rel="noreferrer" className="font-medium text-blue-600 hover:underline">
                Terms &amp; Conditions
              </a>{" "}
              and{" "}
              <a href="/privacy-policy" target="_blank" rel="noreferrer" className="font-medium text-blue-600 hover:underline">
                Listing Policy
              </a>
              .
            </span>
          </label>
          {acceptanceError && <p className="mt-2 text-xs font-medium text-red-600">{acceptanceError}</p>}
        </div>
      )}

      <WizardFooterNav
        onPrevious={goPrevious}
        onSaveDraft={saveDraft}
        onNext={handleNext}
        isSaving={isSaving}
      />
    </div>
  );
};

export default Step9Pricing;
