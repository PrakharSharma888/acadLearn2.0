import React, { useState, useEffect, useCallback } from "react";

// Format "YYYY-MM-DD" → "Mon, 3 Mar 2025"
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
};

// Format "HH:MM" (24h) → "3:30 PM"
const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
};

/**
 * BannerCarousel
 * Props:
 *   banners:       Array<{ _id, title, imageUrl, link, classId, className, classSlug, department, category, eventDate, eventTime, isActive }>
 *   onBannerClick: (banner) => void  — called when banner is clicked
 */
const BannerCarousel = ({ banners = [], onBannerClick }) => {
  const [current, setCurrent] = useState(0);
  const total = banners.length;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-play every 4 seconds when there is more than one banner
  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [total, next]);

  if (total === 0) return null;

  const activeBanner = banners[current];

  const renderImage = (banner) => (
    <img
      src={banner.imageUrl}
      alt={banner.title || "Banner"}
      className="w-full object-contain max-h-64 md:max-h-96 block"
    />
  );

  const renderSlide = (banner) => {
    // Priority 1: parent provides a click handler → always delegate to parent
    if (onBannerClick) {
      return (
        <button
          type="button"
          onClick={() => onBannerClick(banner)}
          className="block w-full cursor-pointer focus:outline-none"
        >
          {renderImage(banner)}
        </button>
      );
    }
    // Priority 2: banner has an external link → open in new tab
    if (banner.link) {
      return (
        <a
          href={banner.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full"
        >
          {renderImage(banner)}
        </a>
      );
    }
    // No action — plain image
    return <div className="w-full">{renderImage(banner)}</div>;
  };

  return (
    <section className="w-full py-8">
      {/* Event date/time bar — shown above carousel when active banner has an event */}
      {activeBanner?.eventDate && (
        <div className="flex justify-center mb-3">
          <div className="inline-flex items-center gap-2 bg-orange-500 text-white text-sm font-bold px-5 py-2 rounded-full shadow-md">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Next Demo: {formatDate(activeBanner.eventDate)}
            {activeBanner.eventTime && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-semibold">
                {formatTime(activeBanner.eventTime)}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="relative w-full overflow-hidden">
        {/* Slides track — translate-x drives the smooth slide */}
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {banners.map((banner) => (
            <div key={banner._id} className="w-full shrink-0">
              {renderSlide(banner)}
            </div>
          ))}
        </div>

        {/* Left arrow — hidden when only 1 banner */}
        {total > 1 && (
          <button
            onClick={prev}
            aria-label="Previous banner"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors text-2xl leading-none select-none"
          >
            &#8249;
          </button>
        )}

        {/* Right arrow — hidden when only 1 banner */}
        {total > 1 && (
          <button
            onClick={next}
            aria-label="Next banner"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors text-2xl leading-none select-none"
          >
            &#8250;
          </button>
        )}
      </div>

      {/* Dot indicators — hidden when only 1 banner */}
      {total > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                idx === current
                  ? "bg-gray-700 scale-125"
                  : "bg-gray-300 hover:bg-gray-500"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default BannerCarousel;
