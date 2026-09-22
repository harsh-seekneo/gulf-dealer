import apiClient from "../../../services/apiClient";
import { API_ENDPOINTS } from "../../../constant/apiEndpoints";
import axios from "axios";

const TOUR_VIDEO_MAX_BYTES = 200 * 1024 * 1024;
const VIDEO_PART_CONCURRENCY = 3;
const VIDEO_PART_RETRY_LIMIT = 3;
const DEFAULT_VIDEO_PART_SIZE = 8 * 1024 * 1024;

const getTourVideoUploadSessionKey = (file) =>
  `gic-dealer-tour-video:${file.name}:${file.size}:${file.lastModified}`;

const getVideoContentType = (file) => {
  if (file.type) return file.type;

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "mov") return "video/quicktime";
  if (extension === "webm") return "video/webm";
  return "video/mp4";
};

const readTourVideoUploadSession = (file) => {
  try {
    return JSON.parse(localStorage.getItem(getTourVideoUploadSessionKey(file)) || "null");
  } catch {
    return null;
  }
};

const writeTourVideoUploadSession = (file, session) => {
  localStorage.setItem(getTourVideoUploadSessionKey(file), JSON.stringify(session));
};

const clearTourVideoUploadSession = (file) => {
  localStorage.removeItem(getTourVideoUploadSessionKey(file));
};

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

  uploadShowroomGallery: async (files) => {
    const imageFiles = Array.from(files || []);

    if (!imageFiles.length) {
      throw new Error("At least one showroom image is required");
    }

    const formData = new FormData();
    imageFiles.forEach((file) => formData.append("showroomGallery", file));

    const res = await apiClient.post(
      API_ENDPOINTS.DEALER.SHOWROOM_GALLERY,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return res.data.data;
  },

  uploadTourVideo: async (file, onProgress) => {
    if (!file) {
      throw new Error("Showroom tour video is required");
    }

    if (file.size > TOUR_VIDEO_MAX_BYTES) {
      throw new Error("Showroom tour video must be 200MB or smaller");
    }

    const existingSession = readTourVideoUploadSession(file);
    const contentType = getVideoContentType(file);
    const session =
      existingSession?.key && existingSession?.uploadId
        ? existingSession
        : (
            await apiClient.post(API_ENDPOINTS.DEALER.TOUR_VIDEO_MULTIPART_START, {
              fileName: file.name,
              contentType,
              fileSize: file.size,
            })
          ).data.data;

    const partSize = session.partSize || DEFAULT_VIDEO_PART_SIZE;
    const totalParts = Math.ceil(file.size / partSize);
    const uploadedParts = new Map(
      (session.uploadedParts || []).map((part) => [part.partNumber, part])
    );
    const inFlightProgress = new Map();

    const persist = () => {
      writeTourVideoUploadSession(file, {
        ...session,
        uploadedParts: Array.from(uploadedParts.values()),
      });
    };

    const reportProgress = () => {
      const completedBytes = Array.from(uploadedParts.keys()).reduce((total, partNumber) => {
        const start = (partNumber - 1) * partSize;
        const end = Math.min(start + partSize, file.size);
        return total + (end - start);
      }, 0);
      const activeBytes = Array.from(inFlightProgress.values()).reduce(
        (total, loaded) => total + loaded,
        0
      );
      onProgress?.(Math.min(100, Math.round(((completedBytes + activeBytes) / file.size) * 100)));
    };

    persist();

    const uploadPart = async (partNumber) => {
      if (uploadedParts.has(partNumber)) {
        reportProgress();
        return;
      }

      const start = (partNumber - 1) * partSize;
      const end = Math.min(start + partSize, file.size);
      const blob = file.slice(start, end);

      for (let attempt = 1; attempt <= VIDEO_PART_RETRY_LIMIT; attempt += 1) {
        try {
          const { uploadUrl } = (
            await apiClient.post(API_ENDPOINTS.DEALER.TOUR_VIDEO_MULTIPART_PART_URL, {
              key: session.key,
              uploadId: session.uploadId,
              partNumber,
            })
          ).data.data;
          const response = await axios.put(uploadUrl, blob, {
            onUploadProgress: (event) => {
              inFlightProgress.set(partNumber, event.loaded || 0);
              reportProgress();
            },
          });
          const eTag = response.headers?.etag || response.headers?.ETag;

          if (!eTag) {
            throw new Error("Video upload failed because S3 did not return an ETag header");
          }

          inFlightProgress.delete(partNumber);
          uploadedParts.set(partNumber, { partNumber, eTag });
          persist();
          reportProgress();
          return;
        } catch (error) {
          inFlightProgress.delete(partNumber);
          if (attempt === VIDEO_PART_RETRY_LIMIT) throw error;
          await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
        }
      }
    };

    let nextPartNumber = 1;
    await Promise.all(
      Array.from({ length: Math.min(VIDEO_PART_CONCURRENCY, totalParts) }, async () => {
        while (nextPartNumber <= totalParts) {
          const partNumber = nextPartNumber;
          nextPartNumber += 1;
          await uploadPart(partNumber);
        }
      })
    );

    const profile = (
      await apiClient.post(API_ENDPOINTS.DEALER.TOUR_VIDEO_MULTIPART_COMPLETE, {
        key: session.key,
        uploadId: session.uploadId,
        fileName: file.name,
        contentType,
        fileSize: file.size,
        parts: Array.from(uploadedParts.values()).sort((a, b) => a.partNumber - b.partNumber),
      })
    ).data.data;

    clearTourVideoUploadSession(file);
    onProgress?.(100);

    return profile;
  },
};
