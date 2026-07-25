import apiClient from "../../../services/apiClient";

export const profileApi = {
  getProfile: async () => {
    const res = await apiClient.get("/dealer/profile");
    return res.data.data;
  },
  updateProfile: async (payload) => {
    const res = await apiClient.patch("/dealer/profile", payload);
    return res.data.data;
  },
  uploadDocument: async (file, docType) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("docType", docType);
    const res = await apiClient.post("/dealer/profile/documents", formData);
    return res.data.data;
  },
  updateCoverBanner: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.patch("/dealer/profile/cover-banner", formData);
    return res.data.data;
  },
};