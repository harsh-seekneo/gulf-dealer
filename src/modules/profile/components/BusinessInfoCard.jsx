import {
  Building2,
  FileText,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";

function Row({ icon: Icon, label, locked = false, value }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon size={18} className="mt-0.5 text-slate-400" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-xs text-slate-400">{label}</p>
          {locked ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
              <ShieldCheck size={11} />
              Locked
            </span>
          ) : null}
        </div>
        <p className="break-words font-semibold text-slate-900">{value || "-"}</p>
      </div>
    </div>
  );
}

export default function BusinessInfoCard({ profile }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
      <h3 className="mb-2 text-lg font-bold">Business Information</h3>
      <div className="divide-y divide-slate-100">
        <Row
          icon={Building2}
          label="Business Name"
          locked={profile.locks?.businessName}
          value={profile.businessName}
        />
        <Row icon={User} label="Owner Name" value={profile.ownerName} />
        <Row
          icon={Phone}
          label="Mobile Number"
          locked={profile.locks?.phone}
          value={profile.phone}
        />
        <Row icon={Mail} label="Email" value={profile.email} />
        <Row icon={MessageCircle} label="WhatsApp" value={profile.whatsapp} />
        <Row icon={FileText} label="Category" value={profile.category} />
        <Row icon={MapPin} label="Location" value={profile.location} />
        <Row icon={Globe} label="Website" value={profile.website} />
      </div>
    </div>
  );
}
