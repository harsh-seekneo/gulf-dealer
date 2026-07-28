import apiClient from "../../../services/apiClient";
import { API_ENDPOINTS } from "../../../constant/apiEndpoints";

export const profileApi = {
  getProfile: async () => {
    const res = await apiClient.get(API_ENDPOINTS.DEALER.PROFILE);
    return res.data.data;
  },

  updateProfile: async (payload) => {
    const res = await apiClient.patch(
      API_ENDPOINTS.DEALER.PROFILE,
      payload
    );
    return res.data.data;
  },

uploadDocument: async (file, name = "Document") => {
  const formData = new FormData();

  formData.append("document", file);
  formData.append("name", name);

  const res = await apiClient.post(
    "/dealer/upload-document",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data.data;
},

  updateCoverBanner: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.patch(
      API_ENDPOINTS.DEALER.COVER_BANNER,
      formData
    );

    return res.data.data;
  },
  updateLogo: async (file) => {
  const formData = new FormData();

  formData.append("logo", file);

  const res = await apiClient.patch(
    "/dealer/profile/logo",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data.data;
},
};