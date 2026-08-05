import apiClient from "../../../services/apiClient";

export const listingsApi = {
  getAll: async (params = {}) => {
    const res = await apiClient.get("/vehicle-listings", {
      params,
    });

    return res.data.data;
  },

  createVehicle: async (data) => {
    const res = await apiClient.post("/vehicle-listings", data);
    return res.data.data;
  },

  deleteVehicle: async (id) => {
    const res = await apiClient.delete(`/vehicle-listings/${id}`);
    return res.data.data;
  },

  toggleActive: async (id) => {
    const res = await apiClient.patch(
      `/vehicle-listings/${id}/toggle-active`
    );

    return res.data.data;
  },

  toggleSold: async (id) => {
    const res = await apiClient.patch(`/vehicle-listings/${id}/toggle-sold`);
    return res.data.data;
  },
}; 