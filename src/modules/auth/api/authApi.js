import apiClient from "../../../services/apiClient";
import { setAccessToken, removeAccessToken } from "../../../utils/tokenStorage";

export const authApi = {
  login: async (identifier, password) => {
    const res = await apiClient.post("/auth/dealer/login", { identifier, password });
    const { accessToken, user } = res.data.data;
    setAccessToken(accessToken);
    return user;
  },
  logout: () => {
    removeAccessToken();
  },
};