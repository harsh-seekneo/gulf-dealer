import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";

import PageLoader from "../components/ui/PageLoader";
import useAuth from "../modules/auth/hooks/useAuth";
import { redirectToUserLogin } from "../utils/authRedirect";

export default function ProtectedRoute() {
  const { isAuthenticated, isDealer, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirectToUserLogin();
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <PageLoader />;
  }

  if (!isDealer) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
