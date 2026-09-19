import apiClient from "../../../services/apiClient";

const appendIfPresent = (formData, key, value) => {
  if (value !== undefined && value !== null && value !== "") {
    formData.append(key, value);
  }
};

const buildAdvertisementFormData = (payload, { status } = {}) => {
  const formData = new FormData();

  appendIfPresent(formData, "name", payload.name);
  appendIfPresent(formData, "category", payload.category);
  appendIfPresent(formData, "packageType", payload.packageType);
  appendIfPresent(formData, "bundleCode", payload.bundleCode);
  appendIfPresent(formData, "redirectTo", payload.redirectTo);
  appendIfPresent(formData, "durationDays", payload.durationDays);
  appendIfPresent(formData, "paymentMethod", payload.paymentMethod);
  appendIfPresent(formData, "useWalletBalance", payload.useWalletBalance);
  appendIfPresent(formData, "useDealerPlanBenefit", payload.useDealerPlanBenefit);
  appendIfPresent(formData, "currentStep", payload.currentStep);
  appendIfPresent(formData, "status", status);
  if (payload.bundleSlots) {
    formData.append("bundleSlots", JSON.stringify(payload.bundleSlots));
  }
  if (payload.details) {
    formData.append("details", JSON.stringify(payload.details));
  }

  ["desktop", "tablet", "mobile"].forEach((device) => {
    const creative = payload.creatives?.[device];

    if (creative instanceof File) {
      formData.append(device, creative);
    }
  });

  (payload.bundleSlots || []).forEach((slot, index) => {
    ["desktop", "tablet", "mobile"].forEach((device) => {
      const creative = slot.creatives?.[device];

      if (creative instanceof File) {
        formData.append(`bundleSlot_${index}_${device}`, creative);
      }
    });
  });

  return formData;
};

export const advertisementsApi = {
  getPlans: async () => {
    const res = await apiClient.get("/advertisement-subscriptions");
    return res.data.data;
  },
  getPromotions: async () => {
    const res = await apiClient.get("/advertisement-promotions");
    return res.data.data;
  },
  getSummary: async () => {
    const res = await apiClient.get("/dealer/advertisements/summary");
    return res.data.data;
  },
  getWallet: async () => {
    const res = await apiClient.get("/wallet/me");
    return res.data.data;
  },
  verifyTapPayment: async (tapId) => {
    const res = await apiClient.get("/payments/tap/return", {
      params: { tap_id: tapId },
    });
    return res.data.data;
  },
  create: async (payload) => {
    const formData = buildAdvertisementFormData(payload, { status: "PENDING" });
    const res = await apiClient.post("/dealer/advertisements", formData);
    return res.data.data;
  },
  saveDraft: async (payload) => {
    const formData = buildAdvertisementFormData(payload);
    const endpoint = payload._id
      ? `/dealer/advertisements/${payload._id}/draft`
      : "/dealer/advertisements/draft";
    const request = payload._id
      ? apiClient.patch(endpoint, formData)
      : apiClient.post(endpoint, formData);
    const res = await request;
    return res.data.data;
  },
  submitDraft: async (id, payload) => {
    const formData = buildAdvertisementFormData(payload, { status: "PENDING" });
    const res = await apiClient.post(`/dealer/advertisements/${id}/submit`, formData);
    return res.data.data;
  },
  getById: async (id) => {
    const res = await apiClient.get(`/dealer/advertisements/${id}`);
    return res.data.data;
  },
  endAd: async (id) => {
    const res = await apiClient.patch(`/dealer/advertisements/${id}/end`);
    return res.data.data;
  },
  downloadInvoice: async (id) => {
    const res = await apiClient.get(`/dealer/advertisements/${id}/invoice`, {
      responseType: "blob",
    });
    return res.data;
  },
};
