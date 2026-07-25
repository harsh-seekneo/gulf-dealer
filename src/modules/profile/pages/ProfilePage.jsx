import { useEffect, useState } from "react";
import { Camera, BadgeCheck, Pencil } from "lucide-react";
import BusinessInfoCard from "../components/BusinessInfoCard";
import VerificationDocumentsCard from "../components/VerificationDocumentsCard";
import WorkingHoursCard from "../components/WorkingHoursCard";
import { profileApi } from "../api/profileApi";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const handleUploadDocument = async (file) => {
    await profileApi.uploadDocument(file, "general");
    load();
  };

  const handleCoverBannerChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await profileApi.updateCoverBanner(file);
    load();
  };

  if (loading) return <p className="text-sm text-slate-400">Loading profile...</p>;
  if (!profile) return <p className="text-sm text-slate-400">Profile not found.</p>;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dealer Profile</h1>
          <p className="text-sm text-slate-500">Manage your business information and verification</p>
        </div>
        {profile.isVerified && (
          <span className="flex w-fit items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700">
            <BadgeCheck size={16} />
            Verified Dealer
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="relative h-40 bg-gradient-to-r from-blue-900 to-blue-700 sm:h-48">
          {profile.coverBannerUrl && (
            <img src={profile.coverBannerUrl} alt="" className="h-full w-full object-cover" />
          )}
          <label className="absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60">
            <Camera size={16} />
            <input type="file" accept="image/*" className="hidden" onChange={handleCoverBannerChange} />
          </label>
        </div>

        <div className="relative flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div className="-mt-10 flex flex-col gap-3 sm:flex-row sm:items-end">
            <img
              src={profile.logoUrl}
              alt=""
              className="h-20 w-20 rounded-2xl border-4 border-white bg-white object-cover shadow"
            />
            <div>
              <h2 className="text-xl font-bold">{profile.businessName}</h2>
              <p className="text-sm text-slate-500">
                {profile.tier} · Member since {profile.memberSince}
              </p>
              <p className="mt-1 flex gap-4 text-sm text-slate-500">
                <span>🚗 {profile.listingsCount} Listings</span>
                <span>👥 {profile.leadsCount} Leads</span>
              </p>
            </div>
          </div>

          <button className="flex w-fit items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50">
            <Pencil size={14} />
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
          <WorkingHoursCard hours={profile.workingHours || []} />
        </div>
      </div>
    </div>
  );
}