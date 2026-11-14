import { useEffect, useState } from "react";
import { AlertCircle, Loader2, MapPin } from "lucide-react";
import { previewListingMapApi } from "../api/vehicleListingApi";
function getListingMapEmbedUrl(location) {
  const { latitude, longitude } = location || {};
  if (!Number.isFinite(latitude) || Math.abs(latitude) > 90 ||
      !Number.isFinite(longitude) || Math.abs(longitude) > 180) return "";

  const delta = 0.01;
  const bounds = [
    Math.max(-180, longitude - delta),
    Math.max(-90, latitude - delta),
    Math.min(180, longitude + delta),
    Math.min(90, latitude + delta),
  ];
  const params = new URLSearchParams({
    bbox: bounds.join(","),
    layer: "mapnik",
    marker: `${latitude},${longitude}`,
  });
  return `https://www.openstreetmap.org/export/embed.html?${params}`;
}

const MapLinkPreview = ({ value, country, savedLocation, hideError }) => {
  const link = value.trim();
  const [result, setResult] = useState(null);
  const savedEmbed = (savedLocation?.mapsLink || savedLocation?.googleMapsUrl) === link
    ? getListingMapEmbedUrl(savedLocation)
    : "";

  useEffect(() => {
    if (!link || savedEmbed) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const coordinates = await previewListingMapApi(link, country, controller.signal);
        if (!controller.signal.aborted) setResult({ link, country, coordinates });
      } catch (error) {
        if (!controller.signal.aborted) {
          const response = error.response?.data;
          const message = response?.details?.field === "mapsLink"
            ? response.message
            : "Couldn't check the Google Maps link right now. Please try again.";
          setResult({ link, country, message });
        }
      }
    }, 500);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [link, country, savedEmbed]);

  if (!link) {
    return (
      <div className="relative mt-3 flex h-44 items-center justify-center overflow-hidden rounded-xl bg-emerald-50">
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(#b8d0bd_1px,transparent_1px),linear-gradient(90deg,#b8d0bd_1px,transparent_1px)] [background-size:80px_50px]" />
        <MapPin className="relative z-10 text-blue-600" size={32} />
        <span className="absolute bottom-3 rounded-lg bg-white px-3 py-1.5 text-xs text-slate-500 shadow">
          Enter Maps link to pin the listing location
        </span>
      </div>
    );
  }

  const currentResult = result?.link === link && result.country === country ? result : null;
  const embed = savedEmbed || getListingMapEmbedUrl(currentResult?.coordinates);

  return (
    <div className="mt-3">
      {embed ? (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <iframe title="Listing location map" className="h-52 w-full" src={embed} loading="lazy" />
        </div>
      ) : !hideError && (
        <p role="status" className={`flex items-center gap-1 text-xs ${currentResult ? "text-red-600" : "text-slate-500"}`}>
          {currentResult ? <AlertCircle size={13} /> : <Loader2 size={13} className="animate-spin" />}
          {currentResult?.message || "Checking Google Maps link..."}
        </p>
      )}
    </div>
  );
};

export default MapLinkPreview;
