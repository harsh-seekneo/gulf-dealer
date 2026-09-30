import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  Building2,
  Camera,
  Car,
  Clock,
  Globe,
  ImagePlus,
  Link2,
  MapPin,
  Pencil,
  Trash2,
  Upload,
  Users,
  Video,
  X,
} from "lucide-react";

import BusinessInfoCard from "../components/BusinessInfoCard";
import VerificationDocumentsCard from "../components/VerificationDocumentsCard";
import WorkingHoursCard from "../components/WorkingHoursCard";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { useToast } from "../../../context/ToastContext";
import useAuth from "../../auth/hooks/useAuth";
import { profileApi } from "../api/profileApi";
import {
  GULF_COUNTRIES,
  getNormalizedLocationCity,
  getNormalizedLocationCountry,
  getNormalizedLocationState,
} from "../../listings/config/gulfLocations.config";
import PhoneNumberField from "../../listings/components/formFields/PhoneNumberField";

const EMPTY_FORM = {
  businessName: "",
  ownerName: "",
  phone: "",
  email: "",
  category: "",
  vehicleCategories: [],
  vehicleBrands: [],
  vehicleBrandsText: "",
  description: "",
  whatsapp: "",
  website: "",
  instagram: "",
  twitter: "",
  facebook: "",
  address: "",
  country: "",
  state: "",
  city: "",
  mapsLink: "",
  hours: {},
};

const WEEK_DAYS = [
  { key: "sun", label: "Sunday" },
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
];

const DEFAULT_DAY_HOURS = { open: false, open24Hours: false, opens: "09:00", closes: "18:00" };

const COUNTRY_DIAL_CODES = {
  Bahrain: "+973",
  "Saudi Arabia": "+966",
  "United Arab Emirates": "+971",
  Kuwait: "+965",
  Oman: "+968",
  Qatar: "+974",
};

const BUSINESS_CATEGORY_OPTIONS = [
  "Showroom",
  "Dealership",
  "Rental Company",
  "Garage",
  "Accessory Dealer",
  "Spare Parts Dealer",
  "Service Provider",
  "Commercial Vehicle Dealer",
  "Heavy Equipment Dealer",
  "Insurance",
];

const VEHICLE_CATEGORY_OPTIONS = [
  "Cars",
  "Motorcycles",
  "Commercial Vehicles",
  "Heavy Equipment",
  "Buggies",
  "Caravans",
];

const fieldClass =
  "mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400";

const textareaClass =
  "mt-2 min-h-24 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const DESCRIPTION_LIMIT = 500;
const getCounterClass = (currentLength, maxLength) => {
  if (currentLength >= maxLength) return "text-red-600";
  if (currentLength >= maxLength * 0.9) return "text-amber-600";
  return "text-slate-400";
};

const buildFormValues = (profile = {}) => {
  const country = getNormalizedLocationCountry(profile.country);
  const state = getNormalizedLocationState(country, profile.state, profile.city);
  const city = getNormalizedLocationCity(country, profile.city, state);

  return {
    businessName: profile.businessName || "",
    ownerName: profile.ownerName || "",
    phone: withCountryDial(profile.phone, country),
    email: profile.email || "",
    category: profile.category || "",
    vehicleCategories: Array.isArray(profile.vehicleCategories)
      ? profile.vehicleCategories
      : [],
    vehicleBrands: Array.isArray(profile.vehicleBrands)
      ? profile.vehicleBrands
      : [],
    vehicleBrandsText: Array.isArray(profile.vehicleBrands)
      ? profile.vehicleBrands.join(", ")
      : "",
    description: profile.description || "",
    whatsapp: withCountryDial(profile.whatsapp, country),
    website: profile.website || "",
    instagram: profile.instagram || "",
    twitter: profile.twitter || "",
    facebook: profile.facebook || "",
    address: profile.address || profile.location || "",
    country,
    state,
    city,
    mapsLink: profile.mapsLink || "",
    hours: normalizeHours(profile.workingHours),
  };
};

const withCountryDial = (value, country) => {
  const raw = String(value || "").trim();
  if (!raw || raw.startsWith("+")) return raw;

  const dial = COUNTRY_DIAL_CODES[country] || "+973";
  return `${dial} ${raw.replace(/\D/g, "")}`.trim();
};

const normalizeHours = (hours = {}) =>
  WEEK_DAYS.reduce((next, day) => {
    next[day.key] = {
      ...DEFAULT_DAY_HOURS,
      ...(hours?.[day.key] || {}),
    };
    return next;
  }, {});

const validateFile = (file) => {
  if (!file) return "Choose a file first.";

  if (!file.type?.startsWith("image/")) {
    return "Please select an image file.";
  }

  if (file.size > 5 * 1024 * 1024) {
    return "File must be 5 MB or smaller.";
  }

  return "";
};

const validateDocumentFile = (file) => {
  if (!file) return "Choose a file first.";

  const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
  const allowedExtensions = ["pdf", "png", "jpg", "jpeg"];
  const extension = file.name?.split(".").pop()?.toLowerCase();

  if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(extension)) {
    return "Please select a PDF, JPG, JPEG or PNG file.";
  }

  if (file.size > 5 * 1024 * 1024) {
    return "Document must be 5 MB or smaller.";
  }

  return "";
};

/* -------------------------------------------------------
   FORM FIELD
------------------------------------------------------- */

function Field({ children, label, locked = false, required = false }) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-xs font-bold text-slate-500">
        {label}

        {required ? <span className="text-red-500">*</span> : null}

        {locked ? (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] uppercase text-emerald-700">
            Locked
          </span>
        ) : null}
      </span>

      {children}
    </label>
  );
}

function CheckboxGroup({ value = [], onChange, options }) {
  const selected = Array.isArray(value) ? value : [];

  const toggle = (option) => {
    onChange(
      selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option],
    );
  };

  return (
    <div className="mt-2 grid gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-2">
      {options.map((option) => (
        <label key={option} className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={selected.includes(option)}
            onChange={() => toggle(option)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  );
}

function FormSection({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm ring-1 ring-slate-200">
          <Icon size={18} />
        </span>
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          {description ? (
            <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function PlanLockedNotice({ children }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold leading-5 text-amber-800">
      {children}
    </div>
  );
}

function UploadAction({ icon: Icon, label, helper, busyLabel, isBusy, accept, multiple = false, disabled, onChange }) {
  return (
    <label
      className={`flex min-h-28 cursor-pointer flex-col justify-between rounded-xl border border-dashed border-slate-300 bg-white p-4 transition hover:border-blue-300 hover:bg-blue-50/40 ${
        disabled ? "pointer-events-none opacity-60" : ""
      }`}
    >
      <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
        <Icon size={18} className="text-blue-600" />
        {isBusy ? busyLabel : label}
      </span>
      <span className="mt-2 text-xs leading-5 text-slate-500">{helper}</span>
      <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white">
        <Upload size={14} />
        Choose file
      </span>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        disabled={disabled}
        onChange={(event) => {
          onChange(event.target.files);
          event.target.value = "";
        }}
      />
    </label>
  );
}

function TimeInput({ value, disabled, onChange }) {
  return (
    <input
      type="time"
      value={value || ""}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400"
    />
  );
}

function WorkingHoursEditor({ value = {}, onChange }) {
  const hours = normalizeHours(value);

  const updateDay = (key, patch) => {
    onChange({
      ...hours,
      [key]: {
        ...hours[key],
        ...patch,
      },
    });
  };

  const copyToAll = (key) => {
    const source = hours[key];
    onChange(
      WEEK_DAYS.reduce((next, day) => {
        next[day.key] = { ...source };
        return next;
      }, {}),
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {WEEK_DAYS.map((day) => {
        const item = hours[day.key] || DEFAULT_DAY_HOURS;

        return (
          <div
            key={day.key}
            className="grid gap-3 border-b border-slate-100 p-3 last:border-b-0 md:grid-cols-[110px_1fr_130px_130px_82px] md:items-center"
          >
            <span className="text-sm font-bold text-slate-800">{day.label}</span>

            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={Boolean(item.open)}
                  onChange={(event) =>
                    updateDay(day.key, {
                      open: event.target.checked,
                      open24Hours: event.target.checked ? Boolean(item.open24Hours) : false,
                    })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Open
              </label>

              <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={Boolean(item.open24Hours)}
                  disabled={!item.open}
                  onChange={(event) =>
                    updateDay(day.key, {
                      open24Hours: event.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                />
                24 hours
              </label>
            </div>

            <TimeInput
              value={item.opens}
              disabled={!item.open || item.open24Hours}
              onChange={(nextValue) => updateDay(day.key, { opens: nextValue })}
            />

            <TimeInput
              value={item.closes}
              disabled={!item.open || item.open24Hours}
              onChange={(nextValue) => updateDay(day.key, { closes: nextValue })}
            />

            <button
              type="button"
              onClick={() => copyToAll(day.key)}
              className="text-left text-xs font-bold text-blue-600 hover:text-blue-700 md:text-center"
            >
              Copy all
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------
   PROFILE FORM
------------------------------------------------------- */

function ProfileForm({
  initialValues,
  profile,
  submitLabel,
  uploading,
  tourVideoProgress,
  onGalleryUpload,
  onTourVideoUpload,
  onSaved,
}) {
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    ...initialValues,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (field) => (event) => {
    const value =
      field === "description"
        ? event.target.value.slice(0, DESCRIPTION_LIMIT)
        : event.target.value;

    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateValue = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const stateOptions = useMemo(
    () =>
      GULF_COUNTRIES.find((country) => country.name === form.country)
        ?.governorates || [],
    [form.country],
  );
  const selectedState = useMemo(
    () => stateOptions.find((state) => state.name === form.state),
    [form.state, stateOptions],
  );
  const cityOptions = selectedState?.cities || [];
  const planFeatures = profile?.planFeatures || {};
  const canUseWebsiteLink = planFeatures.websiteLink !== false;
  const canUseSocialMediaLinks = planFeatures.socialMediaLinks !== false;

  const handleCountryChange = (event) => {
    const nextCountry = event.target.value;

    setForm((current) => ({
      ...current,
      country: nextCountry,
      state: "",
      city: "",
    }));
  };

  const handleStateChange = (event) => {
    const nextState = event.target.value;
    const nextStateData = stateOptions.find((state) => state.name === nextState);

    setForm((current) => ({
      ...current,
      state: nextState,
      city: nextStateData?.cities?.includes(current.city)
        ? current.city
        : nextStateData?.cities?.[0] || "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const payload = { ...form };
      delete payload.businessType;
      delete payload.vehicleBrandsText;

      if (!canUseWebsiteLink) {
        delete payload.website;
      }

      if (!canUseSocialMediaLinks) {
        delete payload.instagram;
        delete payload.twitter;
        delete payload.facebook;
      }

      await profileApi.updateProfile(payload);
      await onSaved();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't save your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      <FormSection
        icon={Building2}
        title="Business Details"
        description="Changes to business name, owner, mobile, and email are sent for admin approval when required."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Business Name" required>
            <input className={fieldClass} required value={form.businessName} onChange={update("businessName")} />
          </Field>

          <Field label="Owner Name" required>
            <input className={fieldClass} required value={form.ownerName} onChange={update("ownerName")} />
          </Field>

          <Field label="Mobile Number" required>
            <div className="mt-2">
              <PhoneNumberField
                value={form.phone}
                onChange={(value) => updateValue("phone", value)}
                placeholder="12345678"
              />
            </div>
          </Field>

          <Field label="Business Email" required>
            <input className={fieldClass} required type="email" value={form.email} onChange={update("email")} />
          </Field>

          <Field label="Business Category">
            <select className={fieldClass} value={form.category} onChange={update("category")}>
              <option value="">Select Business Category</option>
              {BUSINESS_CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </Field>

          <Field label="WhatsApp Number">
            <div className="mt-2">
              <PhoneNumberField
                value={form.whatsapp}
                onChange={(value) => updateValue("whatsapp", value)}
                placeholder="12345678"
              />
            </div>
          </Field>

          <div className="sm:col-span-2">
            <Field label="Vehicle Category">
              <CheckboxGroup
                value={form.vehicleCategories}
                onChange={(value) => updateValue("vehicleCategories", value)}
                options={VEHICLE_CATEGORY_OPTIONS}
              />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea
                className={textareaClass}
                maxLength={DESCRIPTION_LIMIT}
                value={form.description}
                onChange={update("description")}
              />
              <div className={`mt-1 text-right text-xs font-medium ${getCounterClass(form.description.length, DESCRIPTION_LIMIT)}`}>
                {form.description.length}/{DESCRIPTION_LIMIT} characters
              </div>
            </Field>
          </div>
        </div>
      </FormSection>

      <FormSection icon={MapPin} title="Location" description="State / governorate and city are separate values. Pick city from the selected state.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Address">
            <input className={fieldClass} value={form.address} onChange={update("address")} />
          </Field>

          <Field label="Country">
            <select className={fieldClass} value={form.country} onChange={handleCountryChange}>
              <option value="">Select country</option>
              {GULF_COUNTRIES.map((country) => (
                <option key={country.iso2} value={country.name}>{country.name}</option>
              ))}
            </select>
          </Field>

          <Field label="State / Governorate">
            <select className={fieldClass} value={form.state} onChange={handleStateChange} disabled={!form.country}>
              <option value="">Select State / Governorate</option>
              {stateOptions.map((state) => (
                <option key={state.name} value={state.name}>{state.name}</option>
              ))}
            </select>
          </Field>

          <Field label="City / Area">
            <select
              className={fieldClass}
              value={form.city}
              onChange={update("city")}
              disabled={!form.state || !cityOptions.length}
            >
              <option value="">Select City / Area</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
              {form.city && !cityOptions.includes(form.city) ? (
                <option value={form.city}>{form.city}</option>
              ) : null}
            </select>
          </Field>

          <div className="sm:col-span-2">
            <Field label="Google Maps Link">
              <input className={fieldClass} type="url" value={form.mapsLink} onChange={update("mapsLink")} />
            </Field>
          </div>
        </div>
      </FormSection>

      <FormSection icon={Link2} title="Website & Social Links" description="Available fields follow your active business page package.">
        <div className="space-y-4">
          {canUseWebsiteLink ? (
            <Field label="Website">
              <input className={fieldClass} type="url" value={form.website} onChange={update("website")} placeholder="https://yourdealer.com" />
            </Field>
          ) : (
            <PlanLockedNotice>Your current package does not include a website link.</PlanLockedNotice>
          )}

          {canUseSocialMediaLinks ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Instagram">
                <input className={fieldClass} value={form.instagram} onChange={update("instagram")} placeholder="@yourdealer" />
              </Field>

              <Field label="X / Twitter">
                <input className={fieldClass} value={form.twitter} onChange={update("twitter")} placeholder="@yourdealer" />
              </Field>

              <Field label="Facebook">
                <input className={fieldClass} value={form.facebook} onChange={update("facebook")} placeholder="facebook.com/yourdealer" />
              </Field>
            </div>
          ) : (
            <PlanLockedNotice>Your current package does not include social media links.</PlanLockedNotice>
          )}
        </div>
      </FormSection>

      <FormSection icon={Clock} title="Working Hours" description="Update weekly showroom timing directly from this edit form.">
        <WorkingHoursEditor value={form.hours} onChange={(value) => updateValue("hours", value)} />
      </FormSection>

      <FormSection icon={Globe} title="Showroom Media" description="Add showroom photos or replace the tour video from the same edit flow.">
        <div className="grid gap-4 sm:grid-cols-2">
          <UploadAction
            icon={ImagePlus}
            label="Add Showroom Photos"
            busyLabel="Uploading photos..."
            helper={`${profile?.showroomGallery?.length || 0} photos uploaded. New photos are added to the existing gallery.`}
            accept="image/*"
            multiple
            isBusy={uploading === "showroomGallery"}
            disabled={Boolean(uploading)}
            onChange={onGalleryUpload}
          />

          <UploadAction
            icon={Video}
            label={profile?.showroomTourVideo?.url ? "Replace Tour Video" : "Upload Tour Video"}
            busyLabel={`Uploading ${tourVideoProgress}%`}
            helper="MP4, MOV, or WEBM up to 200 MB. This replaces the current tour video."
            accept="video/mp4,video/quicktime,video/webm"
            isBusy={uploading === "showroomTourVideo"}
            disabled={Boolean(uploading)}
            onChange={(files) => onTourVideoUpload(files?.[0])}
          />
        </div>
      </FormSection>

      {error ? <p className="text-sm font-semibold text-red-500">{error}</p> : null}

      <div className=" bottom-0 -mx-4 -mb-4 flex items-center justify-end gap-3 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-5 sm:-mb-5 sm:px-5">
        <button
          type="submit"
          disabled={saving || Boolean(uploading)}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

/* -------------------------------------------------------
   EDIT PROFILE MODAL
------------------------------------------------------- */

function EditProfileModal({
  profile,
  uploading,
  tourVideoProgress,
  onGalleryUpload,
  onTourVideoUpload,
  onClose,
  onSaved,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Edit Business Profile</h2>

            <p className="mt-1 text-sm text-slate-500">
              Update profile details, links, hours, and showroom media. Sensitive changes are sent for approval.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <ProfileForm
            initialValues={buildFormValues(profile)}
            profile={profile}
            uploading={uploading}
            tourVideoProgress={tourVideoProgress}
            onGalleryUpload={onGalleryUpload}
            onTourVideoUpload={onTourVideoUpload}
            submitLabel="Save Changes"
            onSaved={async () => {
              await onSaved();
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   PROFILE PAGE
------------------------------------------------------- */

export default function ProfilePage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploading, setUploading] = useState("");
  const [tourVideoProgress, setTourVideoProgress] = useState(0);
  const [error, setError] = useState("");

  /* -------------------------------------------------------
     LOAD PROFILE
  ------------------------------------------------------- */

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await profileApi.getProfile();
      setProfile(data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load dealer profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* -------------------------------------------------------
     UPLOAD LOGO / COVER / DOCUMENT
  ------------------------------------------------------- */

  const handleUpload = async (type, file) => {
    const validationError =
      type === "document" ? validateDocumentFile(file) : validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(type);
    setError("");

    try {
      if (type === "logo") {
        await profileApi.updateLogo(file);
      }

      if (type === "cover") {
        await profileApi.updateCoverBanner(file);
      }

      if (type === "document") {
        await profileApi.uploadDocument(file, "Trade License Certificate");
      }

      await load();
    } catch (err) {
      setError(
        err.response?.data?.message || "Upload failed. Please try again."
      );
    } finally {
      setUploading("");
    }
  };

  const handleGalleryUpload = async (files) => {
    const imageFiles = Array.from(files || []);

    if (!imageFiles.length) return;

    const validationError = imageFiles.map(validateFile).find(Boolean);

    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading("showroomGallery");
    setError("");

    try {
      const data = await profileApi.uploadShowroomGallery(imageFiles);
      setProfile(data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Gallery upload failed. Please try again."
      );
    } finally {
      setUploading("");
    }
  };

  const handleTourVideoUpload = async (file) => {
    if (!file) return;

    setUploading("showroomTourVideo");
    setTourVideoProgress(0);
    setError("");

    try {
      const data = await profileApi.uploadTourVideo(file, setTourVideoProgress);
      setProfile(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Tour video upload failed. Please try again."
      );
    } finally {
      setUploading("");
    }
  };

  /* -------------------------------------------------------
     WORKING HOURS
  ------------------------------------------------------- */

  const handleSaveWorkingHours = async (hours) => {
    try {
      await profileApi.updateProfile({ hours });
      await load();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save working hours."
      );
    }
  };

  const handleDeleteDealerProfile = async () => {
    setIsDeleting(true);
    setError("");

    try {
      await profileApi.deleteProfile({
        reason: "Deleted by dealer from dealer dashboard",
      });
      showToast("Dealer profile deleted successfully.", "success");
      setIsDeleteOpen(false);
      await refreshUser();
      navigate("/unauthorized", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete dealer profile. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  /* -------------------------------------------------------
     BUSINESS INITIALS
  ------------------------------------------------------- */

  const initials = useMemo(() => {
    const name = String(profile?.businessName || "G");

    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profile?.businessName]);

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-slate-400">Loading profile...</p>
      </div>
    );
  }

  /* -------------------------------------------------------
     ERROR
  ------------------------------------------------------- */

  if (error && !profile) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-600">
        {error}
      </div>
    );
  }

  /* -------------------------------------------------------
     PROFILE UI
  ------------------------------------------------------- */

  return (
    <div className="flex flex-col gap-5">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "Dealer Profile" }]} />

      {/* ---------------------------------------------------
          PAGE HEADER
      --------------------------------------------------- */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dealer Profile
          </h1>

          <p className="text-sm text-slate-500">
            Manage your business information and verification
          </p>
        </div>

        {profile.isVerified ? (
          <span className="flex w-fit items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700">
            <BadgeCheck size={18} className="text-emerald-600" />
            Verified Dealer
          </span>
        ) : null}
      </div>

      {/* ERROR */}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {error}
        </div>
      ) : null}

      {/* ===================================================
          PROFILE HERO
      =================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* COVER BANNER */}

        <div className="relative h-40 bg-gradient-to-r from-blue-950 via-blue-900 to-blue-700 sm:h-52">
          {profile.coverBannerUrl ? (
            <img
              key={profile.coverBannerUrl}
              src={profile.coverBannerUrl}
              alt={`${profile.businessName || "Dealer"} cover`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-blue-950 via-blue-900 to-blue-700" />
          )}

          {/* COVER CAMERA */}

          <label
            title="Update cover banner"
            className={`absolute right-5 top-5 flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30 ${
              uploading === "cover" ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {uploading === "cover" ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Camera size={21} />
            )}

            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading === "cover"}
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  handleUpload("cover", file);
                }

                event.target.value = "";
              }}
            />
          </label>
        </div>

        {/* HERO CONTENT — stacked: logo above name, name/tagline/stats below, left-aligned */}

        <div className="relative px-5 pb-6 pt-0 sm:px-10 sm:pb-8">
          {/* EDIT PROFILE — pinned top-right of the content area */}

          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="absolute right-5 top-20 flex w-fit shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:right-10 sm:top-16"
          >
            <Pencil size={17} strokeWidth={2} />
            Edit Profile
          </button>

          {/* LOGO */}

          <div className="relative -mt-16 h-28 w-28 sm:-mt-20 sm:h-32 sm:w-32 rounded-3xl bg-white p-1.5 shadow-lg">
            <div className="flex h-full w-full items-center justify-center rounded-3xl bg-blue-600 p-2">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
                {profile.logoUrl ? (
                  <img
                    key={profile.logoUrl}
                    src={profile.logoUrl}
                    alt={`${profile.businessName || "Dealer"} logo`}
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-black text-slate-500">
                    {initials || <Building2 size={30} strokeWidth={1.8} />}
                  </div>
                )}
              </div>
            </div>

            {/* LOGO CAMERA — small, subtle badge */}

            <label
              title="Update business logo"
              className={`absolute -right-1.5 -top-1.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-md ring-2 ring-white transition hover:bg-blue-700 ${
                uploading === "logo" ? "pointer-events-none opacity-60" : ""
              }`}
            >
              {uploading === "logo" ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Camera size={13} />
              )}

              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading === "logo"}
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    handleUpload("logo", file);
                  }

                  event.target.value = "";
                }}
              />
            </label>
          </div>

          {/* BUSINESS DETAILS — below the logo, left-aligned */}

          <div className="mt-4 min-w-0 max-w-[70%]">
            <h2 className="truncate text-2xl font-bold text-slate-900 sm:text-3xl">
              {profile.businessName || "Business Name"}
            </h2>

            <p className="mt-2 text-base text-slate-500">
              {profile.tier || "Dealer"}

              {profile.memberSince ? (
                <> · Member since {profile.memberSince}</>
              ) : null}
            </p>

            {profile.subscription?.daysTotal ? (
              <p className="mt-2 text-sm font-semibold text-blue-700">
                {profile.subscription.daysRemaining}/{profile.subscription.daysTotal} days
                {profile.subscription.offerReason
                  ? ` · ${profile.subscription.offerReason}`
                  : ""}
              </p>
            ) : null}

            {/* LISTINGS + LEADS */}

            <div className="mt-4 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Car size={18} className="text-blue-600" />

                <span className="font-medium">
                  {Number(profile.listingsCount || 0).toLocaleString(
                    "en-GB"
                  )}{" "}
                  Listings
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users size={18} className="text-emerald-500" />

                <span className="font-medium">
                  {Number(profile.leadsCount || 0).toLocaleString("en-GB")}{" "}
                  Leads
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Showroom Media</h3>
            <p className="mt-1 text-sm text-slate-500">
              Upload public showroom photos and an optional tour video.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <label className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              {uploading === "showroomGallery" ? "Uploading..." : "Add Photos"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={uploading === "showroomGallery"}
                onChange={(event) => {
                  handleGalleryUpload(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>

            <label className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              {uploading === "showroomTourVideo"
                ? `Uploading ${tourVideoProgress}%`
                : "Upload Tour Video"}
              <input
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                className="hidden"
                disabled={uploading === "showroomTourVideo"}
                onChange={(event) => {
                  handleTourVideoUpload(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </label>
          </div>
        </div>

        {Array.isArray(profile.showroomGallery) && profile.showroomGallery.length ? (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {profile.showroomGallery.map((image, index) => (
              <img
                key={image.key || image.url || index}
                src={image.url || image}
                alt={`Showroom ${index + 1}`}
                className="aspect-[4/3] w-full rounded-xl border border-slate-100 object-cover"
              />
            ))}
          </div>
        ) : null}

        {profile.showroomTourVideo?.url ? (
          <video
            src={profile.showroomTourVideo.url}
            controls
            className="mt-5 aspect-video w-full max-w-3xl rounded-xl bg-black"
          />
        ) : null}
      </div>

      {/* ===================================================
          BUSINESS INFORMATION + RIGHT SIDE
      =================================================== */}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <BusinessInfoCard profile={profile} />

        <div className="flex flex-col gap-5">
          <VerificationDocumentsCard
            documents={profile.documents || []}
            locked={profile.locks?.tradeLicenseCertificate}
            onUpload={(file) => handleUpload("document", file)}
          />

          <WorkingHoursCard
            hours={profile.workingHours || {}}
            onSave={handleSaveWorkingHours}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-red-900">
              Delete dealer profile
            </h3>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-red-700">
              This will delete your dealer profile and permanently remove dealer listings
              and advertisements. Your user account will stay active.
            </p>
            <p className="mt-2 text-sm font-semibold text-red-800">
              To delete your full account, go to User side &gt; My Profile..
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className="flex w-fit items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
          >
            <Trash2 size={17} />
            Delete Dealer Profile
          </button>
        </div>
      </div>

      {/* ===================================================
          EDIT MODAL
      =================================================== */}

      {isEditOpen ? (
        <EditProfileModal
          profile={profile}
          uploading={uploading}
          tourVideoProgress={tourVideoProgress}
          onGalleryUpload={handleGalleryUpload}
          onTourVideoUpload={handleTourVideoUpload}
          onClose={() => setIsEditOpen(false)}
          onSaved={load}
        />
      ) : null}

      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Delete dealer profile?"
        message="This will soft delete your dealer profile and permanently delete dealer listings and advertisements. Your user account will remain active."
        confirmText="Delete Profile"
        cancelText="Keep Profile"
        isLoading={isDeleting}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteDealerProfile}
      />
    </div>
  );
}
