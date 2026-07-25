import { Navigate, Outlet } from "react-router-dom";
import { getAccessToken } from "../utils/tokenStorage";

export default function PublicRoute() {
  const token = getAccessToken();
  return token ? <Navigate to="/dashboard" replace /> : <Outlet />;
}