import { API_ENDPOINTS } from "../../../constant/apiEndpoints";
import apiClient, { refreshClient } from "../../../services/apiClient";
import { removeAccessToken, setAccessToken } from "../../../utils/tokenStorage";

const readPayload = (response) => response.data?.data || response.data || {};

export const getCurrentUserApi = async () => {
     const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
     const payload = readPayload(response);
     console.log("USER PAYLOAD:", payload); // temp
     return payload.user || payload;
   };

export const refreshTokenApi = async () => {
  const response = await refreshClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN);
  const payload = readPayload(response);

  if (!payload.accessToken) {
    throw new Error("Access token not received");
  }

  setAccessToken(payload.accessToken);

  return payload.accessToken;
};

export const logoutUserApi = async () => {
  try {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  } finally {
    removeAccessToken();
  }
};
