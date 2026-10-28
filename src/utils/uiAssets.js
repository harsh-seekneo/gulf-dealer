export const UI_ASSET_BASE_URL = (
  import.meta.env.VITE_UI_ASSET_BASE_URL ||
  "https://gulfincart.s3.ap-south-1.amazonaws.com"
).replace(/\/$/, "");

export const getUiAssetUrl = (path = "") =>
  `${UI_ASSET_BASE_URL}/${String(path).replace(/^\/+/, "")}`;
