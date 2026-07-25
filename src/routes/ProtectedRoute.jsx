import { Navigate, Outlet } from "react-router-dom";
import { getAccessToken } from "../utils/tokenStorage";

export default function ProtectedRoute() {
  const token = getAccessToken();
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}