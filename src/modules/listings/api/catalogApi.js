import apiClient from "../../../services/apiClient";

import { createDeduplicatedReader } from "./requestDeduplication";

const readOptions = createDeduplicatedReader(async (path, params) => {
  const { data } = await apiClient.get(path, { params });
  return data.data;
});

const BASE_URL = "/catalog";

export const getCategoryOptionsApi = async (params) => {
  return readOptions(`${BASE_URL}/categories/options`, params);
};

export const getBrandOptionsApi = async (params) => {
  return readOptions(`${BASE_URL}/brands/options`, params);
};

export const getCatalogModelOptionsApi = async (params) => {
  return readOptions(`${BASE_URL}/models/options`, params);
};

export const getVariantOptionsApi = async (params) => {
  return readOptions(`${BASE_URL}/variants/options`, params);
};

export const getFacetOptionOptionsApi = async (params) => {
  return readOptions(`${BASE_URL}/facet-options/options`, params);
};

export const getListingAttributeOptionsApi = async (params) => {
  return readOptions(`${BASE_URL}/listing-attributes/options`, params);
};

export const getDealerProfileMasterOptionsApi = async (params) => {
  return readOptions(`${BASE_URL}/dealer-profile-masters/options`, params);
};
