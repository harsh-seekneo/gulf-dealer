import apiClient from "../../../services/apiClient";

export const listingsApi = {
  // `signal` (AbortSignal) must be passed as a top-level axios config
  // option, NOT inside `params` — axios serializes everything in
  // `params` into the URL query string, so leaving `signal` in there
  // means it's either silently dropped or serialized into garbage,
  // and the request is never actually cancelled.
  getAll: async ({ signal, ...params } = {}) => {
    const res = await apiClient.get("/vehicle-listings", {
      params,
      signal,
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

  // Alias so ListingsPage's handleToggleFeatured (which calls
  // listingsApi.toggleFeatured) doesn't throw. Remove this once you've
  // confirmed which name should actually be canonical and updated the
  // caller to match.
  toggleFeatured: async (id) => {
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