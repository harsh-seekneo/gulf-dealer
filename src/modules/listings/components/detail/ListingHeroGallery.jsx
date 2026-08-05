import { useState } from "react";
import { PlayCircle } from "lucide-react";

const ListingHeroGallery = ({ media }) => {
  const images = media?.images || [];
  const video = media?.video;
  const featuredImage = media?.featuredImage;

  const allThumbs = [
    ...(featuredImage ? [{ type: "image", url: featuredImage.url }] : []),
    ...images.map((image) => ({ type: "image", url: image.url })),
    ...(video ? [{ type: "video", url: video.url }] : []),
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const activeMedia = allThumbs[activeIndex];

  if (allThumbs.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
        No media uploaded for this listing
      </div>
    );
  }

  return (
    <div className="relative h-64 overflow-hidden rounded-xl sm:h-80">
      {activeMedia?.type === "video" ? (
        <video src={activeMedia.url} controls className="h-full w-full object-cover" />
      ) : (
        <img src={activeMedia?.url} alt="Vehicle" className="h-full w-full object-cover" />
      )}

      <div className="absolute bottom-3 right-3 flex gap-1.5">
        {allThumbs.slice(0, 6).map((thumb, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`h-10 w-14 overflow-hidden rounded-lg border-2 transition-all duration-150 ${
              index === activeIndex ? "border-white" : "border-white/40"
            }`}
          >
            {thumb.type === "video" ? (
              <div className="flex h-full w-full items-center justify-center bg-slate-900">
                <PlayCircle size={16} className="text-white" />
              </div>
            ) : (
              <img src={thumb.url} alt="" className="h-full w-full object-cover" />
            )}
          </button>
        ))}
        {allThumbs.length > 6 && (
          <div className="flex h-10 w-14 items-center justify-center rounded-lg border-2 border-white/40 bg-slate-950/70 text-xs font-semibold text-white">
            +{allThumbs.length - 6}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingHeroGallery;