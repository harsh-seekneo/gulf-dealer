import { useState } from "react";

import { useBulkVehicleWizard } from "../../context/BulkVehicleWizardContext";
import { carFormConfig } from "../../config/categoryForms/carForm.config";
import { commercialFormConfig } from "../../config/categoryForms/commercialForm.config";
import { heavyEquipmentFormConfig } from "../../config/categoryForms/heavyEquipmentForm.config";
import { motorbikeFormConfig } from "../../config/categoryForms/motorbikeForm.config";
import DynamicField from "../formFields/DynamicField";
import WizardFooterNav from "../WizardFooterNav";

const configByFormType = {
  CAR: carFormConfig,
  COMMERCIAL: commercialFormConfig,
  HEAVY_EQUIPMENT: heavyEquipmentFormConfig,
  MOTORBIKE: motorbikeFormConfig,
};

const Step5Specs = () => {
  const { listing, isSaving, saveStep, goPrevious, saveDraft } = useBulkVehicleWizard();

  const formType = listing?.category?.vehicleFormType || "CAR";
  const config = configByFormType[formType] || carFormConfig;

  const existingSpecs = listing?.specs || {};

  const buildInitialForm = () => {
    const initial = {};
    config.specsFields.forEach((field) => {
      if (field.type === "yesNoSelect") {
        const raw = existingSpecs[field.name];
        initial[field.name] = raw === null || raw === undefined ? "" : String(raw);
      } else if (field.type === "toggleSwitch") {
        initial[field.name] = existingSpecs[field.name] ?? false;
      } else {
        initial[field.name] = existingSpecs[field.name] ?? "";
      }
    });
    return initial;
  };

  const [form, setForm] = useState(buildInitialForm);

  const handleChange = (fieldName, value) => {
    setForm((previous) => ({ ...previous, [fieldName]: value }));
  };

  const handleNext = async () => {
    const payload = {};

    config.specsFields.forEach((field) => {
      const rawValue = form[field.name];

      if (field.type === "number") {
        payload[field.name] = rawValue === "" ? null : Number(rawValue);
      } else if (field.type === "yesNoSelect") {
        payload[field.name] = rawValue === "" ? null : rawValue === "true";
      } else if (field.type === "toggleSwitch") {
        payload[field.name] = Boolean(rawValue);
      } else {
        payload[field.name] = rawValue === "" ? undefined : rawValue;
      }
    });

    try {
      await saveStep(5, payload);
    } catch {
      // Error toast already shown by context.
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-950">
        {config.engineSectionTitle || `${config.label} Specifications`}
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        {config.engineSectionDescription || "Add technical details to help buyers make an informed decision."}
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {config.specsFields.map((field) => {
          const isFullWidth = field.type === "toggleSwitch" || field.fullWidth;

          return (
            <div key={field.name} className={isFullWidth ? "sm:col-span-2" : ""}>
              {field.type !== "toggleSwitch" && (
                <label className="mb-1.5 block text-sm font-medium text-slate-700">{field.label}</label>
              )}
              <DynamicField
                field={field}
                value={form[field.name]}
                onChange={(value) => handleChange(field.name, value)}
                error={null}
                form={form}
              />
            </div>
          );
        })}
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

export default Step5Specs;