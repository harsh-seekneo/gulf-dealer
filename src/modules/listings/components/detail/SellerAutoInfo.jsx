import useAuth from "../../../auth/hooks/useAuth";

const SellerAutoInfo = () => {
  const { user } = useAuth();

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Seller Information
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-slate-400">Seller Name</p>
          <p className="text-sm font-semibold text-slate-800">{user?.fullName || "—"}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Email Address</p>
          <p className="text-sm font-semibold text-slate-800">{user?.email || "—"}</p>
        </div>
      </div>
    </div>
  );
};

export default SellerAutoInfo;