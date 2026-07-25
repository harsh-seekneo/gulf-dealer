import apiClient from "../../../services/apiClient";

export const listingsApi = {
  getAll: async (params) => {
    const res = await apiClient.get("/dealer/vehicles", { params });
    return res.data.data;
  },
  deleteVehicle: async (id) => {
    const res = await apiClient.delete(`/dealer/vehicles/${id}`);
    return res.data.data;
  },
  toggleFeatured: async (id) => {
    const res = await apiClient.patch(`/dealer/vehicles/${id}/featured`);
    return res.data.data;
  },
};