import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PLACEHOLDER_IMAGE = "https://placehold.co/120x80?text=Vehicle";
const ASSET_BASE_URL = import.meta.env.VITE_ASSET_BASE_URL || "";

function toUrl(candidate) {
  if (!candidate || typeof candidate !== "string") return null;

  if (
    /^(https?:)?\/\//i.test(candidate) ||
    candidate.startsWith("data:")
  ) {
    return candidate;
  }

  const path = candidate.startsWith("/") ? candidate : `/${candidate}`;
  return `${ASSET_BASE_URL}${path}`;
}

function resolveImages(vehicle) {
  const raw = [
    vehicle?.media?.featuredImage,
    ...(Array.isArray(vehicle?.media?.images)
      ? vehicle.media.images
      : []),
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

    setIndex(
      (prev) => (prev + dir + images.length) % images.length
    );
  };

  return (
    <div className="group/img relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 sm:h-20 sm:w-28">
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

          {/* Image Indicators */}
          <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1 w-1 rounded-full transition ${
                  i === index
                    ? "bg-white"
                    : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function TopPerformingVehicles({
  vehicles = [],
}) {
  return (
    <div className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-5 sm:px-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
            Top Performing Vehicles
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Your recently listed vehicles
          </p>
        </div>

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

            const title =
              vehicle?.vehicleInfo?.title ||
              "Untitled Vehicle";

            const brand =
              vehicle?.vehicleInfo?.brand?.name ||
              vehicle?.vehicleInfo?.brand ||
              "";

            const model =
              vehicle?.vehicleInfo?.catalogModel?.name ||
              vehicle?.vehicleInfo?.catalogModel ||
              "";

            const year =
              vehicle?.vehicleInfo?.manufacturingYear || "";

            const price =
              vehicle?.pricing?.price || 0;

            const views =
              vehicle?.viewCount ||
              vehicle?.views ||
              0;

            const leads =
              vehicle?.leadsCount || 0;

            const daysLabel =
              vehicle?.daysLabel || "N/A";

            return (
              <div
                key={vehicle._id}
                className="flex flex-wrap items-center gap-4 px-4 py-4 transition hover:bg-slate-50 sm:flex-nowrap sm:gap-5 sm:px-6 sm:py-5"
              >
                {/* Vehicle Image */}
                <VehicleImage
                  images={images}
                  alt={title}
                />

                {/* Vehicle Details */}
                <div className="min-w-[140px] flex-1 basis-full sm:basis-auto">
                  <h4 className="truncate text-base font-semibold text-slate-900">
                    {title}
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    {brand}
                    {model && ` ${model}`}
                    {year && ` • ${year}`}
                  </p>

                  <p className="mt-2 text-lg font-bold text-blue-600">
                    BHD{" "}
                    {Number(price).toLocaleString("en-GB")}
                  </p>

                  <p className="mt-1 text-xs font-medium text-green-600">
                    {daysLabel}
                  </p>
                </div>

                {/* Stats */}
                <div className="ml-auto flex items-center gap-6 sm:ml-0 sm:gap-10">
                  {/* Views */}
                  <div className="flex w-16 flex-col items-center sm:w-24">
                    <span className="text-base font-bold text-slate-900 sm:text-lg">
                      {Number(views).toLocaleString("en-GB")}
                    </span>

                    <span className="text-xs text-slate-400">
                      Views
                    </span>
                  </div>

                  {/* Leads */}
                  <div className="flex w-16 flex-col items-center sm:w-24">
                    <span className="text-base font-bold text-blue-600 sm:text-lg">
                      {Number(leads).toLocaleString("en-GB")}
                    </span>

                    <span className="text-xs text-slate-400">
                      Leads
                    </span>
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