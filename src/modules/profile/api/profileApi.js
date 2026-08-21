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
    if (!file) {
      throw new Error("Document is required");
    }

    const formData = new FormData();

    formData.append("document", file);
    formData.append("name", name);

    const res = await apiClient.post(
      API_ENDPOINTS.DEALER.UPLOAD_DOCUMENT,
      formData
    );

    return res.data.data;
  },

  updateCoverBanner: async (file) => {
    if (!file) {
      throw new Error("Cover banner image is required");
    }

    const formData = new FormData();

    formData.append("coverBanner", file);

    const res = await apiClient.patch(
      API_ENDPOINTS.DEALER.COVER_BANNER,
      formData
    );

    return res.data.data;
  },

  updateLogo: async (file) => {
    if (!file) {
      throw new Error("Logo image is required");
    }

    const formData = new FormData();

    formData.append("logo", file);

    const res = await apiClient.patch(
      API_ENDPOINTS.DEALER.LOGO,
      formData
    );

    return res.data.data;
  },
};