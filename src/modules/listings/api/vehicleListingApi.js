import apiClient from "../../../services/apiClient";
import axios from "axios";

const BASE_URL = "/vehicle-listings";
const VIDEO_PART_CONCURRENCY = 3;
const VIDEO_PART_RETRY_LIMIT = 3;
const DEFAULT_VIDEO_PART_SIZE = 8 * 1024 * 1024;

const getVideoUploadSessionKey = (listingId, file) =>
  `gic-video-upload:${listingId}:${file.name}:${file.size}:${file.lastModified}`;

const getVideoContentType = (file) => {
  if (file.type) return file.type;

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "mov") return "video/quicktime";
  if (extension === "webm") return "video/webm";
  return "video/mp4";
};

const readVideoUploadSession = (listingId, file) => {
  try {
    return JSON.parse(localStorage.getItem(getVideoUploadSessionKey(listingId, file)) || "null");
  } catch {
    return null;
  }
};

const writeVideoUploadSession = (listingId, file, session) => {
  localStorage.setItem(getVideoUploadSessionKey(listingId, file), JSON.stringify(session));
};

const clearVideoUploadSession = (listingId, file) => {
  localStorage.removeItem(getVideoUploadSessionKey(listingId, file));
};

export const createDraftListingApi = async () => {
  const { data } = await apiClient.post(BASE_URL);
  return data.data;
};

export const getListingByIdApi = async (listingId) => {
  const { data } = await apiClient.get(`${BASE_URL}/${listingId}`);
  return data.data;
};

export const saveListingStepApi = async (listingId, step, payload) => {
  const { data } = await apiClient.patch(`${BASE_URL}/${listingId}/step/${step}`, payload);
  return data.data;
};

export const saveListingMediaApi = async (listingId, formData) => {
  const { data } = await apiClient.patch(`${BASE_URL}/${listingId}/media`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};

const createListingVideoMultipartUploadApi = async (listingId, payload) => {
  const { data } = await apiClient.post(`${BASE_URL}/${listingId}/video/multipart/start`, payload);
  return data.data;
};

const getListingVideoPartUploadUrlApi = async (listingId, payload) => {
  const { data } = await apiClient.post(`${BASE_URL}/${listingId}/video/multipart/part-url`, payload);
  return data.data;
};

const completeListingVideoMultipartUploadApi = async (listingId, payload) => {
  const { data } = await apiClient.post(`${BASE_URL}/${listingId}/video/multipart/complete`, payload);
  return data.data;
};

export const uploadListingVideoMultipartApi = async ({ listingId, file, onProgress }) => {
  const existingSession = readVideoUploadSession(listingId, file);
  const contentType = getVideoContentType(file);
  const session =
    existingSession?.key && existingSession?.uploadId
      ? existingSession
      : await createListingVideoMultipartUploadApi(listingId, {
          fileName: file.name,
          contentType,
          fileSize: file.size,
        });

  const partSize = session.partSize || DEFAULT_VIDEO_PART_SIZE;
  const totalParts = Math.ceil(file.size / partSize);
  const uploadedParts = new Map(
    (session.uploadedParts || []).map((part) => [part.partNumber, part])
  );
  const inFlightProgress = new Map();

  const persist = () => {
    writeVideoUploadSession(listingId, file, {
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
        const { uploadUrl } = await getListingVideoPartUploadUrlApi(listingId, {
          key: session.key,
          uploadId: session.uploadId,
          partNumber,
        });
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

  const listing = await completeListingVideoMultipartUploadApi(listingId, {
    key: session.key,
    uploadId: session.uploadId,
    fileName: file.name,
    contentType,
    fileSize: file.size,
    parts: Array.from(uploadedParts.values()).sort((a, b) => a.partNumber - b.partNumber),
  });

  clearVideoUploadSession(listingId, file);
  onProgress?.(100);

  return listing;
};

export const deleteDraftListingApi = async (listingId) => {
  const { data } = await apiClient.delete(`${BASE_URL}/${listingId}`);
  return data.data;
};
