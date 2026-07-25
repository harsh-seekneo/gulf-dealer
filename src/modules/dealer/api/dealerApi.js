import { API_ENDPOINTS } from "../../../constant/apiEndpoints";
import apiClient from "../../../services/apiClient";

const readPayload = (response) => response.data?.data || response.data || {};

export const getDealerStatusApi = async () => {
  const response = await apiClient.get(API_ENDPOINTS.DEALER.STATUS);
  return readPayload(response);
};
