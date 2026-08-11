import { useMemo, useState } from "react";

import { useBulkVehicleWizard } from "../../context/BulkVehicleWizardContext";
import { GULF_COUNTRIES } from "../../config/gulfLocations.config";
import FormField from "../FormField";
import ToggleSwitchField from "../ToggleSwitchField";
import WizardFooterNav from "../WizardFooterNav";
import { carFormConfig } from "../../config/categoryForms/carForm.config";
import { commercialFormConfig } from "../../config/categoryForms/commercialForm.config";
import { heavyEquipmentFormConfig } from "../../config/categoryForms/heavyEquipmentForm.config";
import { motorbikeFormConfig } from "../../config/categoryForms/motorbikeForm.config";
import { buggyFormConfig } from "../../config/categoryForms/buggyForm.config";
import { caravanFormConfig } from "../../config/categoryForms/caravanForm.config";
import { specialNumberFormConfig } from "../../config/categoryForms/specialNumberForm.config";

const configByFormType = {
  CAR: carFormConfig,
  COMMERCIAL: commercialFormConfig,
  HEAVY_EQUIPMENT: heavyEquipmentFormConfig,
  MOTORBIKE: motorbikeFormConfig,
  BUGGY: buggyFormConfig,
  CARAVAN: caravanFormConfig,
  SPECIAL_NUMBER: specialNumberFormConfig,
};

const inputClass =
  "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100";

const Step8Location = () => {
  const { listing, isSaving, saveStep, goPrevious, saveDraft } = useBulkVehicleWizard();

  const formType = listing?.category?.vehicleFormType || "CAR";
  const config = configByFormType[formType] || carFormConfig;
  const hasAreaField = Boolean(config.hasAreaField);

  const existingLocation = listing?.location || {};

  const [country, setCountry] = useState(existingLocation.country || "");
  const [governorate, setGovernorate] = useState(existingLocation.governorate || "");
  const [city, setCity] = useState(existingLocation.city || "");
  const [area, setArea] = useState(existingLocation.area || "");
  const [showPhoneNumber, setShowPhoneNumber] = useState(existingLocation.showPhoneNumber ?? true);
  const [showWhatsappNumber, setShowWhatsappNumber] = useState(existingLocation.showWhatsappNumber ?? true);

  const [errors, setErrors] = useState({});

  const governorateOptions = useMemo(() => {
    return GULF_COUNTRIES.find((item) => item.name === country)?.governorates || [];
  }, [country]);

  const cityOptions = useMemo(() => {
    return governorateOptions.find((item) => item.name === governorate)?.cities || [];
  }, [governorateOptions, governorate]);

  const handleCountryChange = (value) => {
    setCountry(value);
    setGovernorate("");
    setCity("");
    setErrors((previous) => ({ ...previous, country: "" }));
  };

  const handleGovernorateChange = (value) => {
    setGovernorate(value);
    setCity("");
    setErrors((previous) => ({ ...previous, governorate: "" }));
  };

  const handleCityChange = (value) => {
    setCity(value);
    setErrors((previous) => ({ ...previous, city: "" }));
  };

  const handleNext = async () => {
    const nextErrors = {};

    if (!country) nextErrors.country = "Country is required";
    if (!governorate) nextErrors.governorate = "Governorate/State is required";
    if (!city) nextErrors.city = "City/Area is required";
    if (hasAreaField && !area) nextErrors.area = "Area is required";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      await saveStep(8, {
        country,
        governorate,
        city,
        area: hasAreaField ? area : undefined,
        showPhoneNumber,
        showWhatsappNumber,
      });
    } catch {
      // Error toast already shown by context.
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-950">Seller &amp; Location</h2>
      <p className="mt-1 text-sm text-slate-500">Tell buyers where the vehicle is located.</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <FormField label="Country" required error={errors.country}>
          <select value={country} onChange={(e) => handleCountryChange(e.target.value)} className={inputClass}>
            <option value="">Select country</option>
            {GULF_COUNTRIES.map((item) => (
              <option key={item.name} value={item.name}>{item.name}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Governorate / State" required error={errors.governorate}>
          <select value={governorate} onChange={(e) => handleGovernorateChange(e.target.value)} disabled={!country} className={inputClass}>
            <option value="">Select governorate</option>
            {governorateOptions.map((item) => (
              <option key={item.name} value={item.name}>{item.name}</option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <FormField label="City / Area" required error={errors.city}>
          <select value={city} onChange={(e) => handleCityChange(e.target.value)} disabled={!governorate} className={inputClass}>
            <option value="">Select city</option>
            {cityOptions.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </FormField>

        {hasAreaField && (
          <FormField label="Area" required error={errors.area}>
            <input
              type="text"
              value={area}
              onChange={(e) => {
                setArea(e.target.value);
                setErrors((previous) => ({ ...previous, area: "" }));
              }}
              placeholder="e.g. Adliya, Deira, Al Olaya"
              disabled={!city}
              className={inputClass}
            />
          </FormField>
        )}
      </div>

      <div className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200 px-4">
        <ToggleSwitchField
          label="Show Phone Number"
          description="Buyers can call you directly"
          checked={showPhoneNumber}
          onChange={setShowPhoneNumber}
        />
        <ToggleSwitchField
          label="Show WhatsApp Number"
          description="Buyers can message you on WhatsApp"
          checked={showWhatsappNumber}
          onChange={setShowWhatsappNumber}
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

export default Step8Location;