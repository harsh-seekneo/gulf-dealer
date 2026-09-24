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
    DELETE_PROFILE: "/dealer/profile",

    LOGO: "/dealer/profile/logo",
    COVER_BANNER: "/dealer/profile/cover-banner",
    SHOWROOM_GALLERY: "/dealer/profile/showroom-gallery",
    TOUR_VIDEO_MULTIPART_START: "/dealer/profile/tour-video/multipart/start",
    TOUR_VIDEO_MULTIPART_PART_URL: "/dealer/profile/tour-video/multipart/part-url",
    TOUR_VIDEO_MULTIPART_COMPLETE: "/dealer/profile/tour-video/multipart/complete",
    TOUR_VIDEO_MULTIPART_ABORT: "/dealer/profile/tour-video/multipart/abort",

    UPLOAD_DOCUMENT: "/dealer/upload-document",

    SUBSCRIPTION: "/dealer/subscription",
  },

  DASHBOARD: {
    SUMMARY: "/dealer/dashboard/summary",
    MONTHLY_VIEWS: "/dealer/dashboard/monthly-views",
  },
};
