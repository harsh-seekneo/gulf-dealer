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

  async pay({ dealerId, paymentMethod }) {
    const { data } = await apiClient.post("/dealer/payment", {
      dealerId,
      paymentMethod,
    });

    return data.data;
  },

  async verifyTapPayment(tapId) {
    const { data } = await apiClient.get("/payments/tap/return", {
      params: { tap_id: tapId },
    });

    return data.data;
  },
};

export const getUsableSubscriptionsApi = async (category) => {
  const { data } = await apiClient.get("/user-subscriptions/me/usable", {
    params: { category },
  });
  return data.data;
};

export const checkActiveSubscriptionApi = async (category) => {
  const { data } = await apiClient.get("/user-subscriptions/me/active", {
    params: { category },
  });
  return data.data;
};

export default subscriptionApi;
