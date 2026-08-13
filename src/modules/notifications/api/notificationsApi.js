import apiClient from "../../../services/apiClient";

export const notificationsApi = {
  getAll: async (params = {}) => {
    const res = await apiClient.get("/notifications", { params });
    return res.data.data;
  },
  markAllRead: async () => {
    const res = await apiClient.patch("/notifications/read-all");
    return res.data.data;
  },
  markRead: async (notificationId) => {
    const res = await apiClient.patch(`/notifications/${notificationId}/read`);
    return res.data.data;
  },
};
