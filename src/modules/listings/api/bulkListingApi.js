import apiClient from "../../../services/apiClient";

const BASE_URL = "/vehicle-listings";

export const createBulkDraftListingApi = async (subscriptionId) => {
  const { data } = await apiClient.post(`${BASE_URL}/bulk`, { subscriptionId });
  return data.data;
};

export const getBulkSessionListingsApi = async (subscriptionId) => {
  const { data } = await apiClient.get(`${BASE_URL}/bulk/${subscriptionId}`);
  return data.data;
};

export const submitBulkSessionApi = async (subscriptionId) => {
  const { data } = await apiClient.post(`${BASE_URL}/bulk/${subscriptionId}/submit`);
  return data.data;
};

export const toggleBumpToTopApi = async (listingId, addOnSubscriptionId) => {
  const { data } = await apiClient.patch(`${BASE_URL}/${listingId}/bump-to-top`, {
    addOnSubscriptionId,
  });
  return data.data;
};

export const submitSingleBulkListingApi = async (listingId) => {
  const { data } = await apiClient.post(`${BASE_URL}/${listingId}/submit-single`);
  return data.data;
};