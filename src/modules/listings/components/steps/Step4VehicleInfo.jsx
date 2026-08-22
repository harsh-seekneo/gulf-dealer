import { useRef, useState } from "react";

import { useBulkVehicleWizard } from "../../context/BulkVehicleWizardContext";
import { carFormConfig } from "../../config/categoryForms/carForm.config";
import { commercialFormConfig } from "../../config/categoryForms/commercialForm.config";
import { heavyEquipmentFormConfig } from "../../config/categoryForms/heavyEquipmentForm.config";
import { motorbikeFormConfig } from "../../config/categoryForms/motorbikeForm.config";
import { buggyFormConfig } from "../../config/categoryForms/buggyForm.config";
import { caravanFormConfig } from "../../config/categoryForms/caravanForm.config";
import { specialNumberFormConfig } from "../../config/categoryForms/specialNumberForm.config";
import DynamicField from "../formFields/DynamicField";
import FormField from "../FormField";
import WizardFooterNav from "../WizardFooterNav";
import PlateSummary from "../detail/PlateSummary";

const configByFormType = {
  CAR: carFormConfig,
  COMMERCIAL: commercialFormConfig,
  HEAVY_EQUIPMENT: heavyEquipmentFormConfig,
  MOTORBIKE: motorbikeFormConfig,
  BUGGY: buggyFormConfig,
  CARAVAN: caravanFormConfig,
  SPECIAL_NUMBER: specialNumberFormConfig,
};

const Step4VehicleInfo = () => {
  const { listing, isSaving, saveStep, goPrevious, saveDraft } = useBulkVehicleWizard();

  const categoryId = listing?.category?._id || listing?.category;
  const formType = listing?.category?.vehicleFormType || "CAR";
  const config = configByFormType[formType] || carFormConfig;

  const existingInfo = listing?.vehicleInfo || {};

  const buildInitialForm = () => {
    const initial = {};
    config.vehicleInfoFields.forEach((field) => {
      if (field.type === "brandSelect") {
        initial[field.name] = existingInfo.brand?._id || existingInfo.brand || "";
      } else if (field.type === "modelSelect") {
        initial[field.name] = existingInfo.catalogModel?._id || existingInfo.catalogModel || "";
      } else if (field.type === "toggleSwitch") {
        initial[field.name] = existingInfo[field.name] ?? false;
      } else {
        initial[field.name] = existingInfo[field.name] ?? "";
      }
    });
    return initial;
  };

  const [form, setForm] = useState(buildInitialForm);
  const [errors, setErrors] = useState({});
  const fieldRefs = useRef({});

  const handleChange = (fieldName, value) => {
    setForm((previous) => {
      const next = { ...previous, [fieldName]: value };
      if (fieldName === "brand") {
        next.catalogModel = "";
        next.variantTrim = "";
      }
      if (fieldName === "catalogModel") next.variantTrim = "";
      return next;
    });
    setErrors((previous) => ({ ...previous, [fieldName]: "" }));
  };

  const scrollToFirstError = (nextErrors) => {
    const firstErrorField = config.vehicleInfoFields.find((field) => nextErrors[field.name]);
    if (firstErrorField) {
      const node = fieldRefs.current[firstErrorField.name];
      if (node) {
        node.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const validate = () => {
    const nextErrors = {};

    config.vehicleInfoFields.forEach((field) => {
      if (field.required && !form[field.name]) {
        nextErrors[field.name] = `${field.label} is required`;
      }
    });

    if (form.vinNumber && String(form.vinNumber).trim().length !== 17) {
      nextErrors.vinNumber = "VIN number must be exactly 17 characters";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      scrollToFirstError(nextErrors);
    }

    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) return;

    const payload = { ...form };

    if (payload.manufacturingYear) payload.manufacturingYear = Number(payload.manufacturingYear);
    if (payload.mileage !== undefined && payload.mileage !== "") payload.mileage = Number(payload.mileage);
    if (payload.vinNumber) payload.vinNumber = String(payload.vinNumber).trim().toUpperCase();

    try {
      await saveStep(4, payload);
    } catch {
      // Error toast already shown by context.
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-950">{config.label} Information</h2>
      <p className="mt-1 text-sm text-slate-500">Provide accurate details to attract buyers.</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {config.vehicleInfoFields.map((field) => {
          const isFullWidth = field.span === 2;

          return (
            <div
              key={field.name}
              ref={(el) => (fieldRefs.current[field.name] = el)}
              className={isFullWidth ? "sm:col-span-2" : ""}
            >
              <FormField label={field.label} required={field.required} error={errors[field.name]}>
                <DynamicField
                  field={field}
                  value={form[field.name]}
                  onChange={(value) => handleChange(field.name, value)}
                  error={errors[field.name]}
                  form={form}
                  categoryId={categoryId}
                />
              </FormField>
            </div>
          );
        })}
      </div>

      {formType === "SPECIAL_NUMBER" && (
        <div className="mt-5">
          <PlateSummary vehicleInfo={form} />
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

export default Step4VehicleInfo;
