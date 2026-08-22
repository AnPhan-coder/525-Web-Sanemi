import React, { useRef, useState, useEffect } from "react";
import { Play, X, Volume2 } from "lucide-react";
import { movieService } from "../../../services/movieService";

/**
 * TrailerPlayer
 * Props:
 *   movieId: number    — ID của phim để tải danh sách các bản lồng tiếng
 *   trailerUrl: string — URL video gốc mặc định
 *   title: string      — Tên phim, dùng cho aria-label
 */
const TrailerPlayer = ({ movieId, trailerUrl, title = "Trailer" }) => {
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const [trailers, setTrailers] = useState([]);
  const [activeTrailerUrl, setActiveTrailerUrl] = useState(trailerUrl);
  const [activeLang, setActiveLang] = useState("Bản gốc");

  useEffect(() => {
    if (movieId) {
      movieService.getMovieTrailers(movieId)
        .then((res) => {
          const trailerList = res.data?.result || [];
          setTrailers(trailerList);
          
          if (trailerList.length > 0) {
            const defaultTrailer = trailerList[0];
            setActiveTrailerUrl(defaultTrailer.trailerUrl);
            setActiveLang(defaultTrailer.languageName || "Bản gốc");
          } else {
            setActiveTrailerUrl(trailerUrl);
            setActiveLang("Bản gốc");
          }
        })
        .catch((err) => {
          console.error("Lỗi khi tải danh sách audio tracks:", err);
          setActiveTrailerUrl(trailerUrl);
          setActiveLang("Bản gốc");
        });
    } else {
      setActiveTrailerUrl(trailerUrl);
      setActiveLang("Bản gốc");
    }
  }, [movieId, trailerUrl]);

  const handleLanguageChange = (url, langName) => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const wasPlaying = !videoRef.current.paused;
      
      setIsLoaded(false);
      setActiveTrailerUrl(url);
      setActiveLang(langName);
      
      // Khôi phục mốc thời gian cũ sau khi đổi nguồn phát
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = currentTime;
          if (wasPlaying) {
            videoRef.current.play().catch(err => console.log(err));
          }
        }
      }, 150);
    }
  };

  if (!activeTrailerUrl) {
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
    <div className="w-full aspect-video bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 relative group">
      {/* Nút chọn kênh âm thanh ở góc */}
      {trailers.length > 1 && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-neutral-700/50 shadow-lg opacity-90 hover:opacity-100 transition-all duration-200">
          <Volume2 size={12} className="text-red-500" />
          <span className="text-[10px] uppercase font-bold text-neutral-400 select-none">Bản âm thanh:</span>
          <select
            value={activeLang}
            onChange={(e) => {
              const selected = trailers.find(t => t.languageName === e.target.value);
              if (selected) {
                handleLanguageChange(selected.trailerUrl, selected.languageName);
              }
            }}
            className="bg-transparent text-xs text-white font-bold outline-none border-none cursor-pointer pr-1 focus:ring-0"
          >
            {trailers.map(t => (
              <option key={t.id} value={t.languageName} className="bg-neutral-900 text-white font-body">
                {t.languageName}
              </option>
            ))}
          </select>
        </div>
      )}

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-950">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-red-500" />
        </div>
      )}
      <video
        ref={videoRef}
        src={activeTrailerUrl}
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
