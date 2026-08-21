// src/modules/dashboard/hooks/useListingViews.js
import { useCallback, useState } from "react";
import { dashboardApi } from "../api/dashboardApi";

/**
 * Manages weekly/monthly listing-view data for WeeklyViewsChart.
 * Weekly data is passed in (it already comes from dashboardApi.getSummary()
 * as part of the main dashboard fetch — no need to fetch it twice).
 * Monthly data is fetched lazily, only the first time the user switches
 * to "This Month" in the chart's dropdown.
 */
export function useListingViews(weeklyViews) {
  const [monthlyData, setMonthlyData] = useState(null);
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  const handleRangeChange = useCallback(
    async (range) => {
      if (range === "month" && monthlyData === null && !monthlyLoading) {
        setMonthlyLoading(true);
        const rows = await dashboardApi.getMonthlyViews();
        setMonthlyData(rows);
        setMonthlyLoading(false);
      }
    },
    [monthlyData, monthlyLoading]
  );

  return {
    weeklyData: weeklyViews,
    monthlyData,
    monthlyLoading,
    handleRangeChange,
  };
}