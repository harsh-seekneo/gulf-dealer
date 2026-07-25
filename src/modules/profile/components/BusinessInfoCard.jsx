import { Building2, User, Phone, Mail, MapPin, Globe } from "lucide-react";

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon size={18} className="mt-0.5 text-slate-400" />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="font-semibold text-slate-900">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function BusinessInfoCard({ profile }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
      <h3 className="mb-2 text-lg font-bold">Business Information</h3>
      <div className="divide-y divide-slate-100">
        <Row icon={Building2} label="Business Name" value={profile.businessName} />
        <Row icon={User} label="Owner Name" value={profile.ownerName} />
        <Row icon={Phone} label="Phone" value={profile.phone} />
        <Row icon={Mail} label="Email" value={profile.email} />
        <Row icon={MapPin} label="Location" value={profile.location} />
        <Row icon={Globe} label="Website" value={profile.website} />
      </div>
    </div>
  );
}