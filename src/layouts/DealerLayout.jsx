import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import DealerSidebar from "../components/layout/DealerSidebar";
import DealerTopbar from "../components/layout/DealerTopbar";
import PageLoader from "../components/ui/PageLoader";
import { getCompanyProfileApi } from "../modules/company/api/companyApi";
import { subscriptionApi } from "../modules/subscription/api/subscriptionApi";
import { useToast } from "../context/ToastContext";

const hasActiveDealerSubscription = (subscription) => {
  if (!subscription || subscription.status !== "ACTIVE") {
    return false;
  }

  if (!subscription.endDate) {
    return false;
  }

  return new Date(subscription.endDate) > new Date();
};

export default function DealerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companyAddress, setCompanyAddress] = useState("");
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(true);
  const toastShownRef = useRef(false);

  useEffect(() => {
    let isActive = true;

    getCompanyProfileApi()
      .then((profile) => {
        if (isActive) {
          setCompanyAddress(profile?.companyAddress || "");
        }
      })
      .catch(() => {
        if (isActive) {
          setCompanyAddress("");
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    setSubscriptionChecked(false);
    subscriptionApi
      .getCurrentPlan()
      .then((subscription) => {
        if (!isActive) {
          return;
        }

        setHasActiveSubscription(hasActiveDealerSubscription(subscription));
      })
      .catch(() => {
        if (isActive) {
          setHasActiveSubscription(false);
        }
      })
      .finally(() => {
        if (isActive) {
          setSubscriptionChecked(true);
        }
      });

    return () => {
      isActive = false;
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!subscriptionChecked || hasActiveSubscription) {
      if (hasActiveSubscription) {
        toastShownRef.current = false;
      }
      return;
    }

    if (!location.pathname.startsWith("/subscription")) {
      if (!toastShownRef.current) {
        showToast(
          "Your business subscription has expired. Please renew, upgrade, or choose a plan to continue.",
          "error",
          5000,
        );
        toastShownRef.current = true;
      }
      navigate("/subscription", { replace: true });
    }
  }, [
    hasActiveSubscription,
    location.pathname,
    navigate,
    showToast,
    subscriptionChecked,
  ]);

  const subscriptionLocked =
    subscriptionChecked &&
    !hasActiveSubscription &&
    !location.pathname.startsWith("/subscription");

  return (
    <div className="flex min-h-screen items-start bg-slate-50">
      <DealerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
        <DealerTopbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6">
          {!subscriptionChecked || subscriptionLocked ? <PageLoader /> : <Outlet />}
        </main>
        {companyAddress ? (
          <footer className="border-t border-slate-200 bg-white px-4 py-3 text-xs font-medium text-slate-500 sm:px-6">
            {companyAddress}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
