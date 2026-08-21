export const API_ENDPOINTS = {
  AUTH: {
    ME: "/user/me",
    REFRESH_TOKEN: "/auth/user/refresh-token",
    LOGOUT: "/auth/user/logout",
  },

  DEALER: {
    STATUS: "/dealer/status",
    DRAFT: "/dealer/draft",

    PROFILE: "/dealer/profile",

    LOGO: "/dealer/profile/logo",
    COVER_BANNER: "/dealer/profile/cover-banner",

    UPLOAD_DOCUMENT: "/dealer/upload-document",

    SUBSCRIPTION: "/dealer/subscription",
  },

  DASHBOARD: {
    SUMMARY: "/dealer/dashboard/summary",
    MONTHLY_VIEWS: "/dealer/dashboard/monthly-views",
  },
};