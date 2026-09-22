"use client";

import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

import { useBulkVehicleWizard } from "../../context/BulkVehicleWizardContext";

const Step11Done = () => {
  const { listing } = useBulkVehicleWizard();

  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="flex h-16 w-16 animate-[popIn_0.4s_ease-out] items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 size={32} className="text-emerald-600" />
      </div>

      <h2 className="mt-4 text-xl font-bold text-slate-950">Listing Submitted!</h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
       Your listing has been successfully submitted for review. You&apos;ll be
        notified once it has been approved and is live on GulfInCart.
      </p>

      <div className="mt-6 grid w-full max-w-md grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-400">
            Listing ID
          </p>
          <p className="mt-1 text-sm font-bold text-blue-600">
            #{listing?.listingId || "—"}
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Status</p>
          <p className="mt-1 text-sm font-bold text-amber-600">Pending Review</p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-400">
            Estimated Review Time
          </p>
          <p className="mt-1 text-sm font-bold text-slate-700">Within 12 hour</p>
        </div>
      </div>

      <Link
        to="/vehicles"
        className="mt-6 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Go to My Listings →
      </Link>
    </div>
  );
};

export default Step11Done;
