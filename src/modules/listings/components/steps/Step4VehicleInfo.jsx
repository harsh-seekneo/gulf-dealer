"use client";

import { useEffect, useRef, useState } from "react";

import { useBulkVehicleWizard } from "../../context/BulkVehicleWizardContext";
import useAuth from "../../../auth/hooks/useAuth";
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
import { scrollFirstWizardError } from "../../utils/wizardScroll";
import { normalizePhoneContact, validatePhoneContact } from "../../utils/phoneNumber";
import { useListingAttributeConfig } from "../../hooks/useListingAttributeConfig";

const ELECTRIC_DEPENDENT_FIELDS = new Set(["engineCapacity", "numberOfCylinders"]);

const isElectricFuel = (value) =>
  String(value || "").trim().toLowerCase() === "electric";

const matchesFieldCondition = (form, condition) =>
  !condition ||
  (typeof condition.value === "string"
    ? String(form?.[condition.field] || "").toLowerCase() === condition.value.toLowerCase()
    : form?.[condition.field] === condition.value);

const configByFormType = {
  CAR: carFormConfig,
  COMMERCIAL: commercialFormConfig,
  HEAVY_EQUIPMENT: heavyEquipmentFormConfig,
  MOTORBIKE: motorbikeFormConfig,
  BUGGY: buggyFormConfig,
  CARAVAN: caravanFormConfig,
  SPECIAL_NUMBER: specialNumberFormConfig,
};

const getInfoTitle = (formType, config) => {
  if (formType === "SPECIAL_NUMBER") return "Plate Info";
  if (formType === "CARAVAN") return "Caravan Information";
  return `${config.label} Information`;
};

const Step4VehicleInfo = ({ useWizardHook = useBulkVehicleWizard }) => {
  const { listing, isSaving, saveStep, goPrevious, saveDraft } =
    useWizardHook();
  const { user } = useAuth();

  const categoryId = listing?.category?._id || listing?.category;
  const formType = listing?.category?.vehicleFormType || "CAR";
  const baseConfig = configByFormType[formType] || carFormConfig;
  const { config } = useListingAttributeConfig(categoryId, baseConfig);
  const infoTitle = getInfoTitle(formType, config);

  const existingInfo = listing?.vehicleInfo || {};
  const dealerProfile = user?.dealerProfile || user?.dealer || {};
  const accountSellerName =
    dealerProfile.businessName ||
    user?.businessName ||
    user?.dealerName ||
    user?.fullName ||
    user?.name ||
    "";
  const accountPhone = `${user?.countryCode || ""} ${user?.phone || ""}`.trim();
  const accountWhatsapp =
    `${user?.whatsappCountryCode || user?.countryCode || ""} ${
      user?.whatsapp || user?.whatsappNumber || user?.phone || ""
    }`.trim();
  const accountEmail = user?.email || dealerProfile.email || "";
  const visibleVehicleInfoFields = config.vehicleInfoFields.filter(
    (field) => !field.dealerOnly
  );

  const buildInitialForm = () => {
    const initial = {};
    visibleVehicleInfoFields.forEach((field) => {
      if (field.type === "brandSelect") {
        initial[field.name] = existingInfo.brand?._id || existingInfo.brand || "";
      } else if (field.type === "modelSelect") {
        initial[field.name] = existingInfo.catalogModel?._id || existingInfo.catalogModel || "";
      } else if (field.type === "toggleSwitch") {
        initial[field.name] = existingInfo[field.name] ?? false;
      } else if (field.name === "sellerName") {
        initial[field.name] = accountSellerName || existingInfo[field.name] || "";
      } else if (field.name === "mobileNumber") {
        initial[field.name] = existingInfo[field.name] || accountPhone;
      } else if (field.name === "whatsappNumber") {
        initial[field.name] = existingInfo[field.name] || accountWhatsapp || accountPhone;
      } else if (field.name === "contactEmail") {
        initial[field.name] = existingInfo[field.name] || accountEmail;
      } else {
        initial[field.name] = existingInfo[field.name] ?? "";
      }
    });
    return initial;
  };

  const [form, setForm] = useState(buildInitialForm);
  const [errors, setErrors] = useState({});
  const fieldRefs = useRef({});
  const hasFuelType = String(form?.fuelType || "").trim() !== "";
  const isElectric = isElectricFuel(form?.fuelType);
  const shouldHideField = (field) =>
    (isElectric && ELECTRIC_DEPENDENT_FIELDS.has(field.name)) ||
    !matchesFieldCondition(form, field.showWhen);
  const activeVehicleInfoFields = visibleVehicleInfoFields.filter(
    (field) => !shouldHideField(field)
  );
  const isRequiredField = (field) =>
    (Boolean(field.required) &&
      !(field.requiredUnless && matchesFieldCondition(form, field.requiredUnless))) ||
    (hasFuelType && !isElectric && ELECTRIC_DEPENDENT_FIELDS.has(field.name));

  useEffect(() => {
    if (!accountSellerName && !accountPhone && !accountWhatsapp && !accountEmail) return;

    const timeoutId = window.setTimeout(() => {
      setForm((previous) => ({
        ...previous,
        sellerName: accountSellerName || previous.sellerName || "",
        mobileNumber: previous.mobileNumber || accountPhone,
        whatsappNumber: previous.whatsappNumber || accountWhatsapp || accountPhone,
        contactEmail: previous.contactEmail || accountEmail,
      }));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [accountEmail, accountPhone, accountSellerName, accountWhatsapp]);

  const handleChange = (fieldName, value) => {
    setForm((previous) => {
      const next = { ...previous, [fieldName]: value };
      if (fieldName === "brand") {
        next.catalogModel = "";
        next.variantTrim = "";
      }
      if (fieldName === "catalogModel") next.variantTrim = "";
      if (fieldName === "mobileNumber" && previous.whatsappAvailable) next.whatsappNumber = value;
      if (fieldName === "whatsappAvailable" && value) next.whatsappNumber = previous.mobileNumber || "";
      if (fieldName === "bodyType" && String(value).toLowerCase() !== "other") next.caravanTypeOther = "";
      if (fieldName === "mileageNotApplicable" && value) next.mileage = "";
      return next;
    });
    setErrors((previous) => ({
      ...previous,
      [fieldName]: "",
      ...(fieldName === "mobileNumber" || fieldName === "whatsappAvailable" ? { whatsappNumber: "" } : {}),
      ...(fieldName === "bodyType" ? { caravanTypeOther: "" } : {}),
      ...(fieldName === "mileageNotApplicable" ? { mileage: "" } : {}),
    }));
  };

  const validate = () => {
    const nextErrors = {};

    activeVehicleInfoFields.forEach((field) => {
      if (isRequiredField(field) && !form[field.name]) {
        nextErrors[field.name] = `${field.label} is required`;
      }

      if (field.type === "phone") {
        const fieldValue = field.name === "whatsappNumber" && form.whatsappAvailable
          ? form.mobileNumber
          : form[field.name];
        const phoneError = validatePhoneContact(fieldValue, field.label);
        if (field.required || fieldValue) {
          if (phoneError) nextErrors[field.name] = phoneError;
        }
      }
    });

    if (form.vinNumber && String(form.vinNumber).trim().length !== 17) {
      nextErrors.vinNumber = "VIN number must be exactly 17 characters";
    }

    setErrors(nextErrors);

    scrollFirstWizardError(
      fieldRefs,
      activeVehicleInfoFields.map((field) => field.name),
      nextErrors
    );

    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) return;

    const payload = { ...form, sellerName: accountSellerName || form.sellerName || "" };
    delete payload.companyName;
    visibleVehicleInfoFields.forEach((field) => {
      if (shouldHideField(field)) payload[field.name] = null;
    });
    if (payload.whatsappAvailable) payload.whatsappNumber = payload.mobileNumber;
    visibleVehicleInfoFields.forEach((field) => {
      if (field.type === "phone" && payload[field.name]) {
        payload[field.name] = normalizePhoneContact(payload[field.name]);
      }
    });

    if (payload.mileageNotApplicable) payload.mileage = null;
    if (payload.manufacturingYear) payload.manufacturingYear = Number(payload.manufacturingYear);
    if (payload.mileage !== undefined && payload.mileage !== "" && payload.mileage !== null) payload.mileage = Number(payload.mileage);
    if (payload.vinNumber) payload.vinNumber = String(payload.vinNumber).trim().toUpperCase();

    await saveStep(4, payload);
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-950">{infoTitle}</h2>
      <p className="mt-1 text-sm text-slate-500">
        Provide accurate details to attract buyers.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {activeVehicleInfoFields.map((field) => {
          const renderField =
            field.name === "sellerName" ? { ...field, readOnly: true } : field;
          const isFullWidth = field.span === 2;

          return (
            <div
              key={field.name}
              ref={(node) => {
                fieldRefs.current[field.name] = node;
              }}
              className={isFullWidth ? "sm:col-span-2" : ""}
            >
              {field.type === "toggleSwitch" ? (
                <>
                  <DynamicField
                    field={renderField}
                    value={form[field.name]}
                    onChange={(value) => handleChange(field.name, value)}
                    error={errors[field.name]}
                    form={form}
                    categoryId={categoryId}
                  />
                  {errors[field.name] ? (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      {errors[field.name]}
                    </p>
                  ) : null}
                </>
              ) : (
                <FormField label={field.label} required={isRequiredField(field)} error={errors[field.name]}>
                  <DynamicField
                    field={renderField}
                    value={form[field.name]}
                    onChange={(value) => handleChange(field.name, value)}
                    error={errors[field.name]}
                    form={form}
                    categoryId={categoryId}
                  />
                </FormField>
              )}
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
