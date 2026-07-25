import { Routes, Route, Navigate } from "react-router-dom";
import DealerLayout from "../layouts/DealerLayout";
import ProtectedRoute from "../routes/ProtectedRoute";

import DashboardPage from "../modules/dashboard/pages/DashboardPage";
import ListingsPage from "../modules/listings/pages/ListingsPage";
import LeadsPage from "../modules/leads/pages/LeadsPage";
import AdvertisementsPage from "../modules/advertisements/pages/AdvertisementsPage";
import AdDetailPage from "../modules/advertisements/pages/AdDetailPage";
import SubscriptionPage from "../modules/subscription/pages/SubscriptionPage";
import ProfilePage from "../modules/profile/pages/ProfilePage";
import NotificationsPage from "../modules/notifications/pages/NotificationsPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DealerLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/vehicles" element={<ListingsPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/advertisements" element={<AdvertisementsPage />} />
          <Route path="/advertisements/:id" element={<AdDetailPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
