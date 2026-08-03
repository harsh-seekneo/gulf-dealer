import { useState } from "react";

import { useBulkVehicleWizard } from "../../context/BulkVehicleWizardContext";
import FormField from "../FormField";
import ToggleSwitchField from "../ToggleSwitchField";
import WizardFooterNav from "../WizardFooterNav";

const Step9Pricing = () => {
  const { listing, isSaving, saveStep, goPrevious, saveDraft } = useBulkVehicleWizard();

  const existingPricing = listing?.pricing || {};
  const listingType = listing?.listingType;

  const [price, setPrice] = useState(
    existingPricing.price !== null && existingPricing.price !== undefined ? String(existingPricing.price) : ""
  );
  const [isNegotiable, setIsNegotiable] = useState(existingPricing.isNegotiable ?? false);
  const [error, setError] = useState("");

  const handlePriceChange = (value) => {
    if (value === "" || /^\d*\.?\d{0,3}$/.test(value)) {
      setPrice(value);
      setError("");
    }
  };

  const handleNext = async () => {
    const numericPrice = Number(price);

    if (!price || Number.isNaN(numericPrice) || numericPrice <= 0) {
      setError("Please enter a valid price");
      return;
    }

    try {
      await saveStep(9, { price: numericPrice, isNegotiable });
    } catch {
      // Error toast already shown by context.
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-950">Pricing</h2>
      <p className="mt-1 text-sm text-slate-500">Set a competitive price to attract serious buyers.</p>

      <div className="mt-5">
        <FormField label={listingType === "RENT" ? "Rental Price (BHD / day)" : "Listing Price (BHD)"} required error={error}>
          <div className={`flex h-11 items-center overflow-hidden rounded-lg border ${error ? "border-red-400" : "border-slate-300"} focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100`}>
            <span className="border-r border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-500">BHD</span>
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
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 px-4">
        <ToggleSwitchField
          label="Price Negotiable"
          description="Buyers can negotiate the listed price"
          checked={isNegotiable}
          onChange={setIsNegotiable}
        />
      </div>

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