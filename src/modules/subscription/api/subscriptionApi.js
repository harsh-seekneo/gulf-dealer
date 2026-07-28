import apiClient from "../../../services/apiClient";

export const subscriptionApi = {
  /**
   * Get current dealer subscription
   * GET /api/v1/dealer/subscription
   */
  async getCurrentPlan() {
    const { data } = await apiClient.get("/dealer/subscription");
    return data.data;
  },

  /**
   * Get available business page plans
   * GET /api/v1/dealer/plans
   */
  async getAvailablePlans() {
    const { data } = await apiClient.get("/dealer/plans");

    return {
      plans: data.data || [],
      compareRows: [],
      compareColumns: [],
    };
  },

  /**
   * Select subscription plan
   * POST /api/v1/dealer/submit
   */
  async choosePlan({ dealerId, planId, durationDays }) {
    const { data } = await apiClient.post("/dealer/submit", {
      dealerId,
      planId,
      durationDays,
    });

    return data.data;
  },
};

export default subscriptionApi;