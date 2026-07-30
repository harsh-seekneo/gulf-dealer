import apiClient from "../../../services/apiClient";

export const leadsApi = {
  getAll: async (params = {}) => {
    const res = await apiClient.get("/dealer/leads", { params });
    return res.data.data;
  },
  exportCrm: async () => {
    const res = await apiClient.get("/dealer/leads/export", {
      responseType: "blob",
    });
    return res.data;
  },
};
