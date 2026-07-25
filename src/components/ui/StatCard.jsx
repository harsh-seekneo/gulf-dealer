export default function StatCard({ icon: Icon, value, label, iconBg = "bg-blue-100 text-blue-600" }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon size={20} />
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}