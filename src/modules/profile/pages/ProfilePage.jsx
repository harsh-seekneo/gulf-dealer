import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Building2,
  Camera,
  Car,
  ImagePlus,
  Pencil,
  Users,
  X,
} from "lucide-react";

import BusinessInfoCard from "../components/BusinessInfoCard";
import VerificationDocumentsCard from "../components/VerificationDocumentsCard";
import WorkingHoursCard from "../components/WorkingHoursCard";
import { profileApi } from "../api/profileApi";

const EMPTY_FORM = {
  businessName: "",
  ownerName: "",
  phone: "",
  email: "",
  category: "",
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
};

const fieldClass =
  "mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400";

const textareaClass =
  "mt-2 min-h-24 w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500";

const buildFormValues = (profile = {}) => ({
  businessName: profile.businessName || "",
  ownerName: profile.ownerName || "",
  phone: profile.phone || "",
  email: profile.email || "",
  category: profile.category || "",
  description: profile.description || "",
  whatsapp: profile.whatsapp || "",
  website: profile.website || "",
  instagram: profile.instagram || "",
  twitter: profile.twitter || "",
  facebook: profile.facebook || "",
  address: profile.address || profile.location || "",
  country: profile.country || "",
  state: profile.state || "",
  city: profile.city || "",
  mapsLink: profile.mapsLink || "",
});

const validateFile = (file) => {
  if (!file) return "Choose a file first.";
  if (file.size > 5 * 1024 * 1024) return "File must be 5 MB or smaller.";
  return "";
};

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

function ProfileForm({ initialValues, locks = {}, submitLabel, onSaved }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialValues });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await profileApi.updateProfile(form);
      await onSaved();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't save your profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
      <Field label="Business Name" required locked={locks.businessName}>
        <input
          className={fieldClass}
          disabled={locks.businessName}
          required
          value={form.businessName}
          onChange={update("businessName")}
        />
      </Field>

      <Field label="Owner Name" required>
        <input
          className={fieldClass}
          required
          value={form.ownerName}
          onChange={update("ownerName")}
        />
      </Field>

      <Field label="Mobile Number" required locked={locks.phone}>
        <input
          className={fieldClass}
          disabled={locks.phone}
          required
          value={form.phone}
          onChange={update("phone")}
        />
      </Field>

      <Field label="Business Email" required>
        <input
          className={fieldClass}
          required
          type="email"
          value={form.email}
          onChange={update("email")}
        />
      </Field>

      <Field label="Business Category">
        <input
          className={fieldClass}
          value={form.category}
          onChange={update("category")}
        />
      </Field>

      <Field label="WhatsApp">
        <input
          className={fieldClass}
          value={form.whatsapp}
          onChange={update("whatsapp")}
        />
      </Field>

      <div className="sm:col-span-2">
        <Field label="Description">
          <textarea
            className={textareaClass}
            maxLength={500}
            value={form.description}
            onChange={update("description")}
          />
        </Field>
      </div>

      <Field label="Website">
        <input
          className={fieldClass}
          type="url"
          value={form.website}
          onChange={update("website")}
        />
      </Field>

      <Field label="Google Maps Link">
        <input
          className={fieldClass}
          type="url"
          value={form.mapsLink}
          onChange={update("mapsLink")}
        />
      </Field>

      <Field label="Address">
        <input
          className={fieldClass}
          value={form.address}
          onChange={update("address")}
        />
      </Field>

      <Field label="City">
        <input
          className={fieldClass}
          value={form.city}
          onChange={update("city")}
        />
      </Field>

      <Field label="State">
        <input
          className={fieldClass}
          value={form.state}
          onChange={update("state")}
        />
      </Field>

      <Field label="Country">
        <input
          className={fieldClass}
          value={form.country}
          onChange={update("country")}
        />
      </Field>

      <Field label="Instagram">
        <input
          className={fieldClass}
          value={form.instagram}
          onChange={update("instagram")}
        />
      </Field>

      <Field label="X / Twitter">
        <input
          className={fieldClass}
          value={form.twitter}
          onChange={update("twitter")}
        />
      </Field>

      <div className="sm:col-span-2">
        <Field label="Facebook">
          <input
            className={fieldClass}
            value={form.facebook}
            onChange={update("facebook")}
          />
        </Field>
      </div>

      {error ? <p className="sm:col-span-2 text-sm font-semibold text-red-500">{error}</p> : null}

      <button
        type="submit"
        disabled={saving}
        className="sm:col-span-2 mt-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {saving ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

function EditProfileModal({ profile, onClose, onSaved }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Edit Business Profile</h2>
            <p className="mt-1 text-sm text-slate-500">
              Approved dealers cannot change business name, mobile number, or Trade License Certificate.
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

        <ProfileForm
          initialValues={buildFormValues(profile)}
          locks={profile.locks || {}}
          submitLabel="Save Changes"
          onSaved={async () => {
            await onSaved();
            onClose();
          }}
        />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [uploading, setUploading] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await profileApi.getProfile();
      setProfile(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load dealer profile.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (type, file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(type);
    setError("");

    try {
      if (type === "logo") {
        await profileApi.updateLogo(file);
      } else if (type === "cover") {
        await profileApi.updateCoverBanner(file);
      } else if (type === "document") {
        await profileApi.uploadDocument(file, "Trade License Certificate");
      }

      await load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Upload failed. Please try again.",
      );
    } finally {
      setUploading("");
    }
  };

  const handleSaveWorkingHours = async (hours) => {
    await profileApi.updateProfile({ hours });
    await load();
  };

  const initials = useMemo(
    () =>
      String(profile?.businessName || "G")
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    [profile?.businessName],
  );

  if (loading) {
    return <p className="text-sm text-slate-400">Loading profile...</p>;
  }

  if (error && !profile) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dealer Profile</h1>
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

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="relative h-40 bg-gradient-to-r from-blue-900 to-blue-700 sm:h-48">
          {profile.coverBannerUrl ? (
            <img
              src={profile.coverBannerUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : null}
          <label className="absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60">
            <ImagePlus size={18} strokeWidth={2} />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading === "cover"}
              onChange={(event) => handleUpload("cover", event.target.files?.[0])}
            />
          </label>
        </div>

        <div className="relative flex flex-col gap-6 px-5 pb-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div className="-mt-10 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="relative h-20 w-20 shrink-0">
              {profile.logoUrl ? (
                <img
                  src={profile.logoUrl}
                  alt=""
                  className="h-20 w-20 rounded-2xl border-4 border-white bg-white object-cover shadow"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-slate-100 text-xl font-black text-slate-500 shadow">
                  {initials || <Building2 size={34} strokeWidth={1.8} />}
                </div>
              )}
              <label className="absolute -right-2 -top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white ring-4 ring-white">
                <Camera size={15} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading === "logo"}
                  onChange={(event) => handleUpload("logo", event.target.files?.[0])}
                />
              </label>
            </div>

            <div>
              <h2 className="text-xl font-bold">{profile.businessName}</h2>
              <p className="text-sm text-slate-500">
                {profile.tier || "Dealer"} - Member since {profile.memberSince}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-5 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Car size={16} className="text-blue-600" />
                  <span>{profile.listingsCount} Listings</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-emerald-600" />
                  <span>{profile.leadsCount} Leads</span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="flex w-fit items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            <Pencil size={16} strokeWidth={2} />
            Edit Profile
          </button>
        </div>
      </div>

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

      {isEditOpen ? (
        <EditProfileModal
          profile={profile}
          onClose={() => setIsEditOpen(false)}
          onSaved={load}
        />
      ) : null}
    </div>
  );
}
