import apiClient from "../../../services/apiClient";

export const notificationsApi = {
  getAll: async () => {
    const res = await apiClient.get("/dealer/notifications");
    return res.data.data;
  },
  markAllRead: async () => {
    const res = await apiClient.patch("/dealer/notifications/mark-all-read");
    return res.data.data;
  },
};