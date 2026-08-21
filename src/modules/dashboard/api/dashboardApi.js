// src/modules/dashboard/api/dashboardApi.js
import apiClient from "../../../services/apiClient";
import { API_ENDPOINTS } from "../../../constant/apiEndpoints";

const DEFAULT_DASHBOARD = {
  stats: {
    activeListings: 0,
    totalViews: 0,
    leadsReceived: 0,
  },
  subscription: {
    daysRemaining: null,
    daysLabel: "N/A",
  },
  weeklyViews: [],
  topVehicles: [],
};

export const dashboardApi = {
  /**
   * Fetch Dealer Dashboard Summary
   * Always resolves — falls back to DEFAULT_DASHBOARD on any error so the
   * dashboard page never has to special-case a failed request.
   */
  async getSummary() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DASHBOARD.SUMMARY);
      const dashboard = response?.data?.data || response?.data || {};

      return {
        stats: {
          activeListings: dashboard?.stats?.activeListings ?? 0,
          totalViews: dashboard?.stats?.totalViews ?? 0,
          leadsReceived: dashboard?.stats?.leadsReceived ?? 0,
        },
        subscription: {
          daysRemaining: dashboard?.subscription?.daysRemaining ?? null,
          daysLabel: dashboard?.subscription?.daysLabel ?? "N/A",
        },
        weeklyViews: Array.isArray(dashboard?.weeklyViews) ? dashboard.weeklyViews : [],
        topVehicles: Array.isArray(dashboard?.topVehicles) ? dashboard.topVehicles : [],
      };
    } catch (error) {
      console.error(
        "Failed to load dashboard summary:",
        error?.response?.status,
        error?.response?.data || error.message
      );
      return DEFAULT_DASHBOARD;
    }
  },

  /**
   * Fetch monthly listing-view stats.
   * NOTE: requires API_ENDPOINTS.DASHBOARD.MONTHLY_VIEWS to exist in
   * apiEndpoints.js (add it next to SUMMARY, pointing at your real
   * monthly-stats route). Resolves to [] on any error, same fallback
   * pattern as getSummary.
   */
  async getMonthlyViews() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DASHBOARD.MONTHLY_VIEWS);
      const rows = response?.data?.data || response?.data || [];
      return Array.isArray(rows) ? rows : [];
    } catch (error) {
      console.error(
        "Failed to load monthly views:",
        error?.response?.status,
        error?.response?.data || error.message
      );
      return [];
    }
  },
};