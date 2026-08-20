//[DEALER] /Users/personal/Desktop/gulf--dealer/gulf-dealer/src/modules/dashboard/components/TopPerformingVehicles.jsx

import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PLACEHOLDER_IMAGE = "https://placehold.co/120x80?text=Vehicle";
const ASSET_BASE_URL = import.meta.env.VITE_ASSET_BASE_URL || "";

function toUrl(candidate) {
  if (!candidate || typeof candidate !== "string") return null;

  if (/^(https?:)?\/\//i.test(candidate) || candidate.startsWith("data:")) {
    return candidate;
  }

  const path = candidate.startsWith("/") ? candidate : `/${candidate}`;
  return `${ASSET_BASE_URL}${path}`;
}

function resolveImages(vehicle) {
  const raw = [
    vehicle?.media?.featuredImage,
    ...(Array.isArray(vehicle?.media?.images) ? vehicle.media.images : []),
    vehicle?.image,
    ...(Array.isArray(vehicle?.images) ? vehicle.images : []),
  ];

  const urls = raw
    .map((item) => (typeof item === "string" ? item : item?.url))
    .map(toUrl)
    .filter(Boolean);

  const unique = [...new Set(urls)];

  return unique.length ? unique : [PLACEHOLDER_IMAGE];
}

function VehicleImage({ images, alt }) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  const src = failed ? PLACEHOLDER_IMAGE : images[index];
  const hasMultiple = images.length > 1;

  const go = (e, dir) => {
    e.preventDefault();
    e.stopPropagation();

    setFailed(false);

    setIndex((prev) => (prev + dir + images.length) % images.length);
  };

  return (
    <div className="group/img relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        loading="lazy"
        onError={() => setFailed(true)}
      />

      {hasMultiple && (
        <>
          {/* Previous Image */}
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => go(e, -1)}
            className="absolute left-0.5 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-0.5 text-white opacity-0 transition group-hover/img:opacity-100"
          >
            <ChevronLeft size={12} />
          </button>

          {/* Next Image */}
          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => go(e, 1)}
            className="absolute right-0.5 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-0.5 text-white opacity-0 transition group-hover/img:opacity-100"
          >
            <ChevronRight size={12} />
          </button>
        </>
      )}
    </div>
  );
}

export default function TopPerformingVehicles({ vehicles = [] }) {
  return (
    <div className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-6 py-5">
        <h3 className="text-xl font-bold text-slate-900">
          Top Performing Vehicles
        </h3>

        <Link
          to="/vehicles"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          View All
        </Link>
      </div>

      {/* Empty State */}
      {vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 text-5xl">🚗</div>

          <h4 className="text-lg font-semibold text-slate-800">
            No Vehicles Listed
          </h4>

          <p className="mt-2 text-sm text-slate-500">
            Add your first vehicle to see it here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {vehicles.map((vehicle) => {
            const images = resolveImages(vehicle);

            const title = vehicle?.vehicleInfo?.title || "Untitled Vehicle";

            const price = vehicle?.pricing?.price || 0;

            const views = vehicle?.viewCount || vehicle?.views || 0;

            const leads = vehicle?.leadsCount || 0;

            return (
              <div
                key={vehicle._id}
                className="flex items-center gap-4 px-6 py-5 transition hover:bg-slate-50"
              >
                {/* Vehicle Image */}
                <VehicleImage images={images} alt={title} />

                {/* Vehicle Details */}
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-lg font-bold text-slate-900">
                    {title}
                  </h4>

                  <p className="mt-1 text-base text-slate-500">
                    BHD {Number(price).toLocaleString("en-GB")}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-10">
                  {/* Views */}
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-slate-900">
                      {Number(views).toLocaleString("en-GB")}
                    </span>

                    <span className="text-sm text-slate-400">views</span>
                  </div>

                  {/* Leads */}
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-blue-600">
                      {Number(leads).toLocaleString("en-GB")}
                    </span>

                    <span className="text-sm text-slate-400">leads</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}