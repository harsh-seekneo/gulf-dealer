import apiClient from "../../../services/apiClient";

export const dashboardApi = {
  getSummary: async () => {
    const res = await apiClient.get("/dealer/dashboard/summary");
    return res.data.data;
  },
};