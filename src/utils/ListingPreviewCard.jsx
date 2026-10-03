import { BadgeCheck, Clock3, Eye, Heart, Rocket, Star } from "lucide-react";

const getRelativeDate = (value) => {
  if (!value) return "";

  const diffMs = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(diffMs)) return "";

  const diffDays = Math.max(0, Math.floor(diffMs / 86400000));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 Day ago";
  return `${diffDays} Days ago`;
};

/*
 * Static (non-interactive) copy of the user-site MarketplaceCard.
 * Keep visually in sync with the user app card.
 */
const ListingPreviewCard = ({
  image,
  isFeatured = false,
  isBumpedToTop = false,
  title,
  price,
  meta = [],
  location,
  seller,
  sellerVerified = false,
  views,
  publishedAt,
  cta = "View Details",
  actions = true,
  className = "",
}) => {
  const visibleMeta = meta.slice(0, 4);
  const relativeDate = getRelativeDate(publishedAt);

  const MAX_MOBILE = 2;
  const MAX_DESKTOP = 4;
  const hiddenMobile = meta.length - MAX_MOBILE;
  const hiddenDesktop = meta.length - MAX_DESKTOP;

  return (
    <article
      className={`pointer-events-none w-full select-none overflow-hidden rounded-xl border border-[#e6ebf3] bg-white shadow-sm max-sm:flex max-sm:h-full max-sm:flex-col sm:rounded-2xl ${className}`}
    >
      {image ? (
        <div className="relative aspect-[1.4] overflow-hidden bg-slate-100 sm:aspect-[1.45]">
          <img
            src={image}
            alt={`${title || "Listing"} image`}
            className="h-full w-full object-cover"
          />

          {isBumpedToTop || isFeatured ? (
            <span
              className={`absolute left-2 top-2 z-10 inline-flex items-center justify-center rounded-full text-white shadow-sm sm:left-3 sm:top-3 ${
                isBumpedToTop
                  ? "h-6 w-6 bg-[#2454ef] sm:h-8 sm:w-8"
                  : "gap-0.5 bg-[#e88200] px-1.5 py-0.5 text-[9px] font-bold sm:gap-1 sm:px-2.5 sm:py-1 sm:text-[11px]"
              }`}
            >
              {isBumpedToTop ? (
                <Rocket className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <>
                  <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3" fill="currentColor" />
                  Featured
                </>
              )}
            </span>
          ) : null}

          {views ? (
            <span className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-1 rounded-full bg-slate-950/55 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm sm:bottom-2.5 sm:right-2.5 sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[11px]">
              <Eye className="h-2.5 w-2.5 sm:h-[13px] sm:w-[13px]" />
              {views}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col p-2 max-sm:flex-1 sm:min-h-[218px] sm:p-3">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-1 sm:min-h-6 sm:gap-3">
            {price ? (
              <p className="min-w-0 flex-1 truncate text-[13px] font-extrabold leading-tight text-[#202124] sm:whitespace-normal sm:break-words sm:text-[18px]">
                {price}
              </p>
            ) : (
              <p className="min-w-0 flex-1 truncate text-[13px] font-extrabold leading-tight text-[#202124] sm:text-[18px]">
                Price on request
              </p>
            )}

            {relativeDate ? (
              <p className="flex shrink-0 items-center gap-1 pt-0.5 text-[9px] font-semibold text-[#a0a2a7] sm:text-[11px]">
                <Clock3 size={13} className="hidden sm:block" />
                {relativeDate}
              </p>
            ) : null}
          </div>

          {title ? (
            <span
              className="mt-1 block break-words text-[11px] font-bold leading-[14px] text-[#2454ef] sm:mt-2 sm:min-h-8 sm:text-sm sm:leading-4"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {title}
            </span>
          ) : null}

          {visibleMeta.length ? (
            <div className="mt-1 flex flex-nowrap items-center gap-1 overflow-hidden sm:mt-2 sm:gap-1.5">
              {meta.slice(0, MAX_DESKTOP).map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  title={item}
                  className={`inline-block min-w-0 max-w-[48%] shrink truncate whitespace-nowrap rounded-full bg-[#f5f5f6] px-1.5 py-0.5 text-[9px] font-semibold text-[#9fa1a5] sm:max-w-[40%] sm:py-1 sm:text-[11px] ${
                    index >= MAX_MOBILE ? "hidden sm:inline-block" : ""
                  }`}
                >
                  {item}
                </span>
              ))}

              {hiddenMobile > 0 ? (
                <span className="shrink-0 rounded-full bg-[#eef2ff] px-1.5 py-0.5 text-[9px] font-bold text-[#2454ef] sm:hidden">
                  +{hiddenMobile}
                </span>
              ) : null}

              {hiddenDesktop > 0 ? (
                <span className="hidden shrink-0 rounded-full bg-[#eef2ff] px-2 py-1 text-[11px] font-bold text-[#2454ef] sm:inline-block">
                  +{hiddenDesktop}
                </span>
              ) : null}
            </div>
          ) : null}

          {location ? (
            <p className="mt-1 truncate text-[10px] font-semibold text-[#9fa1a5] sm:mt-2 sm:text-xs">
              {location}
            </p>
          ) : null}

          {seller ? (
            <p className="mt-1 flex min-w-0 items-center gap-1 text-[10px] font-bold text-[#202124] sm:mt-2 sm:gap-1.5 sm:text-xs">
              <span className="truncate">{seller}</span>
              {sellerVerified ? (
                <BadgeCheck
                  size={14}
                  className="h-3 w-3 shrink-0 text-[#2fc966] sm:h-3.5 sm:w-3.5"
                  fill="currentColor"
                  strokeWidth={3}
                />
              ) : null}
            </p>
          ) : null}
        </div>

        {cta || actions ? (
          <div className="mt-auto flex items-stretch gap-1.5 pt-2 sm:gap-2 sm:pt-3">
            {cta ? (
              <span className="flex h-7 flex-1 items-center justify-center rounded-xl bg-[#2454ef] px-2 text-[11px] font-bold text-white sm:h-9 sm:px-4 sm:text-sm">
                {cta}
              </span>
            ) : null}

            {actions ? (
              <span className="flex h-7 w-8 shrink-0 flex-col items-center justify-center rounded-lg bg-[#f7f7f8] text-[#2454ef] sm:h-9 sm:w-10">
                <Heart size={16} />
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
};

export default ListingPreviewCard;