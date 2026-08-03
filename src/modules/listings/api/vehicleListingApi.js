import apiClient from "../../../services/apiClient";

const BASE_URL = "/vehicle-listings";

export const createDraftListingApi = async () => {
  const { data } = await apiClient.post(BASE_URL);
  return data.data;
};

export const getListingByIdApi = async (listingId) => {
  const { data } = await apiClient.get(`${BASE_URL}/${listingId}`);
  return data.data;
};

export const saveListingStepApi = async (listingId, step, payload) => {
  const { data } = await apiClient.patch(`${BASE_URL}/${listingId}/step/${step}`, payload);
  return data.data;
};

export const saveListingMediaApi = async (listingId, formData) => {
  const { data } = await apiClient.patch(`${BASE_URL}/${listingId}/media`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};

export const deleteDraftListingApi = async (listingId) => {
  const { data } = await apiClient.delete(`${BASE_URL}/${listingId}`);
  return data.data;
};