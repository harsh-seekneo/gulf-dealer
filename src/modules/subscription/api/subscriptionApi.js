import apiClient from "../../../services/apiClient";

export const subscriptionApi = {
  getCurrentPlan: async () => {
    const res = await apiClient.get("/dealer/subscription/current");
    return res.data.data;
  },
  getAvailablePlans: async () => {
    const res = await apiClient.get("/dealer/subscription/plans");
    return res.data.data;
  },
  choosePlan: async (planId) => {
    const res = await apiClient.post("/dealer/subscription/choose", { planId });
    return res.data.data;
  },
};