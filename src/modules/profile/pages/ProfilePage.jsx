// [ADMIN] /Users/personal/Desktop/gulf-dealer/src/modules/profile/pages/ProfilePage.jsx
import { useEffect, useState } from "react";
import {
  Camera,
  BadgeCheck,
  Pencil,
  Building2,
  X,
  Car,
  Users,
  Upload,
  Eye,
  FileText,
  Clock3,
  Globe,
  Phone,
  Mail,
  MapPin,
  ImagePlus,
} from "lucide-react";import BusinessInfoCard from "../components/BusinessInfoCard";
import VerificationDocumentsCard from "../components/VerificationDocumentsCard";
import WorkingHoursCard from "../components/WorkingHoursCard";
import { profileApi } from "../api/profileApi";
import useAuth from "../../auth/hooks/useAuth";

const EMPTY_FORM = {
  businessName: "",
  ownerName: "",
  phone: "",
  email: "",
  location: "",
  website: "",
};

const FORM_FIELDS = [
  { key: "businessName", label: "Business Name", required: true },
  { key: "ownerName", label: "Owner Name", required: true },
  { key: "phone", label: "Phone", required: true },
  { key: "email", label: "Email", type: "email", required: true },
  { key: "location", label: "Location" },
  { key: "website", label: "Website" },
];

// Shared form used both for first-time completion and for editing.
function ProfileForm({ initialValues, submitLabel, onSaved }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initialValues });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await profileApi.updateProfile(form);
      await onSaved();
    } catch (err) {
      console.error("Failed to save profile:", err);
      setError("Couldn't save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
      {FORM_FIELDS.map((f) => (
        <div key={f.key}>
          <label className="mb-1 block text-xs font-semibold text-slate-500">
            {f.label}
            {f.required && <span className="text-red-500"> *</span>}
          </label>
          <input
            type={f.type || "text"}
            required={f.required}
            value={form[f.key]}
            onChange={handleChange(f.key)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </div>
      ))}

      {error && <p className="col-span-full text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="col-span-full mt-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {saving ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

function CompleteProfileForm({ onSaved }) {
  return (
    <div className="mx-auto max-w-xl rounded-xl bg-white p-6 text-center shadow-sm sm:p-8">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <Building2 size={22} />
      </div>
      <h2 className="text-lg font-bold">Complete Your Business Profile</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
        Add your business details so buyers and the sidebar/dashboard can
        show your dealership correctly.
      </p>

      <div className="mt-6">
        <ProfileForm initialValues={EMPTY_FORM} submitLabel="Save Profile" onSaved={onSaved} />
      </div>
    </div>
  );
}

function EditProfileModal({ profile, onClose, onSaved }) {
  const initialValues = {
    businessName: profile.businessName || "",
    ownerName: profile.ownerName || "",
    phone: profile.phone || "",
    email: profile.email || "",
    location: profile.location || "",
    website: profile.website || "",
  };

  const handleSaved = async () => {
    await onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">Edit Business Profile</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <ProfileForm
          initialValues={initialValues}
          submitLabel="Save Changes"
          onSaved={handleSaved}
        />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { refreshProfile } = useAuth();

  const load = async () => {
    setLoading(true);
    try {
      const data = await profileApi.getProfile();
      setProfile(data);
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Keep the sidebar/topbar (AuthContext) in sync whenever profile data changes here.
  const loadAndSync = async () => {
    await load();
    refreshProfile();
  };

  const handleUploadDocument = async (file) => {
    await profileApi.uploadDocument(file, "general");
    loadAndSync();
  };

  const handleCoverBannerChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await profileApi.updateCoverBanner(file);
    loadAndSync();
  };

  const handleSaveWorkingHours = async (hours) => {
    await profileApi.updateProfile({ hours });
    await loadAndSync();
  };

  if (loading) return <p className="text-sm text-slate-400">Loading profile...</p>;

  if (!profile) {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold">Dealer Profile</h1>
          <p className="text-sm text-slate-500">Manage your business information and verification</p>
        </div>
        <CompleteProfileForm onSaved={loadAndSync} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dealer Profile</h1>
          <p className="text-sm text-slate-500">Manage your business information and verification</p>
        </div>
        {profile.isVerified && (
          <span className="flex w-fit items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700">
            <BadgeCheck
    size={18}
    className="text-emerald-600 fill-emerald-100"
/>
            Verified Dealer
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="relative h-40 bg-gradient-to-r from-blue-900 to-blue-700 sm:h-48">
          {profile.coverBannerUrl ? (
            <img src={profile.coverBannerUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
          <label className="absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60">
            <ImagePlus size={18} strokeWidth={2} />
            <input type="file" accept="image/*" className="hidden" onChange={handleCoverBannerChange} />
          </label>
        </div>

        <div className="relative flex flex-col gap-6 px-5 pb-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div className="-mt-10 flex flex-col gap-3 sm:flex-row sm:items-end">
            {profile.logoUrl ? (
              <img
                src={profile.logoUrl}                alt=""
                className="h-20 w-20 rounded-2xl border-4 border-white bg-white object-cover shadow"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-slate-100 text-slate-400 shadow">
                <Building2
    size={34}
    strokeWidth={1.8}
    className="text-slate-400"
/>
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold">{profile.businessName}</h2>
              <p className="text-sm text-slate-500">
                {profile.tier} · Member since {profile.memberSince}
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
            onUpload={handleUploadDocument}
          />
          <WorkingHoursCard
            hours={profile.workingHours || []}
            onSave={handleSaveWorkingHours}
          />
        </div>
      </div>

      {isEditOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setIsEditOpen(false)}
          onSaved={loadAndSync}
        />
      )}
    </div>
  );
}