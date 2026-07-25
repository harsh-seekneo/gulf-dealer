import apiClient from "../../../services/apiClient";

export const advertisementsApi = {
  getSummary: async () => {
    const res = await apiClient.get("/dealer/advertisements/summary");
    return res.data.data;
  },
  getById: async (id) => {
    const res = await apiClient.get(`/dealer/advertisements/${id}`);
    return res.data.data;
  },
  endAd: async (id) => {
    const res = await apiClient.patch(`/dealer/advertisements/${id}/end`);
    return res.data.data;
  },
  downloadInvoice: async (id) => {
    const res = await apiClient.get(`/dealer/advertisements/${id}/invoice`, {
      responseType: "blob",
    });
    return res.data;
  },
};