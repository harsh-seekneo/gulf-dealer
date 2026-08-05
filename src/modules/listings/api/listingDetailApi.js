import apiClient from "../../../services/apiClient";

const BASE_URL = "/vehicle-listings";

export const getListingDetailApi = async (listingId) => {
  const res = await apiClient.get(`${BASE_URL}/${listingId}`);
  return res.data.data;
};

export const saveListingStepApi = async (listingId, step, payload) => {
  const res = await apiClient.patch(`${BASE_URL}/${listingId}/step/${step}`, payload);
  return res.data.data;
};