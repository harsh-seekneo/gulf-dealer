import useAuth from "../hooks/useAuth";
import { USER_APP_URL } from "../../../config/env";

export default function UnauthorizedPage() {
  const { logout } = useAuth();
  const profileUrl = `${USER_APP_URL.replace(/\/$/, "")}/profile`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">
          Dealer access required
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          This dashboard is only available for authenticated GulfInCart dealer
          accounts.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <a
            href={profileUrl}
            onClick={() => logout()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Go to GulfInCart
          </a>
        </div>
      </div>
    </main>
  );
}
