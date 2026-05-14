import React, { useRef, useState } from "react";
import { Play, X } from "lucide-react";

/**
 * TrailerPlayer
 * Props:
 *   trailerUrl: string — URL video (local hoặc hosted)
 *   title: string      — Tên phim, dùng cho aria-label
 */
const TrailerPlayer = ({ trailerUrl, title = "Trailer" }) => {
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!trailerUrl) {
    return (
      <div className="w-full aspect-video bg-neutral-900 rounded-xl border border-neutral-800 flex flex-col items-center justify-center gap-3 text-neutral-600">
        <Play size={40} />
        <p className="text-sm">Chưa có trailer</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="w-full aspect-video bg-neutral-900 rounded-xl border border-red-900/40 flex flex-col items-center justify-center gap-3 text-red-500">
        <X size={40} />
        <p className="text-sm">Không thể tải trailer</p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 relative">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-950">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-red-500" />
        </div>
      )}
      <video
        ref={videoRef}
        src={trailerUrl}
        controls
        className={`w-full h-full object-contain transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        aria-label={`Trailer phim ${title}`}
        onCanPlay={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        preload="metadata"
      />
    </div>
  );
};

export default TrailerPlayer;
