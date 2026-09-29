import axios from "axios";

import { API_BASE_URL, API_WITH_CREDENTIALS } from "../../../config/env";

export const getCompanyProfileApi = async () => {
  const response = await axios.get(`${API_BASE_URL}/auth/company-profile`, {
    withCredentials: API_WITH_CREDENTIALS,
  });

  return response.data.data;
};
