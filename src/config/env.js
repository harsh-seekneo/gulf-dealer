export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

export const USER_APP_URL =
  import.meta.env.VITE_USER_APP_URL || "http://localhost:3000";

export const USER_LOGIN_URL = `${USER_APP_URL.replace(/\/$/, "")}/login`;

export const API_WITH_CREDENTIALS =
  import.meta.env.VITE_API_WITH_CREDENTIALS !== "false";
