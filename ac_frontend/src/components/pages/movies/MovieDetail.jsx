import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { movieService } from "../../../services/movieService";
import { showtimeService } from "../../../services/showtimeService";
import { format, isSameDay, compareAsc } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Clock,
  Calendar,
  Play,
  MapPin,
  User,
  Film,
  Info,
  ChevronLeft,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import { useApiCall } from "../../../hooks/useApiCall";
import { LoadingSkeleton } from "../common/LoadingSpinner";
import TrailerPlayer from "../common/TrailerPlayer";
import ReviewSection from "../../ReviewSection";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.1,
    },
  },
};

const fadeUpVariant = {
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  },
};


const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [trailerOpen, setTrailerOpen] = useState(false);

  const { loading, execute } = useApiCall();

  useEffect(() => {
    fetchMovieData();
  }, [id]);

  // Đóng modal khi nhấn ESC
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") setTrailerOpen(false); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const fetchMovieData = async () => {
    await execute(
      async () => {
        const [movieRes, showRes] = await Promise.all([
          movieService.getMovieById(id),
          showtimeService.getShowtimesByMovie(id),
        ]);

        setMovie(movieRes.data.result || movieRes.data);
        setShowtimes(showRes.data.result || showRes.data || []);
      },
      { showSuccessToast: false }
    );
  };

  const availableDates = useMemo(() => {
    if (!showtimes.length) return [];

    const dates = new Set();
    const now = new Date();

    showtimes.forEach((show) => {
      const showDate = new Date(show.startTime);
      if (showDate >= now) {
        dates.add(format(showDate, "yyyy-MM-dd"));
      }
    });

    return Array.from(dates)
      .sort()
      .map((dateStr) => new Date(dateStr));
  }, [showtimes]);

  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates]);

  const showtimesOnDate = useMemo(() => {
    if (!selectedDate || !showtimes.length) return [];

    return showtimes
      .filter((show) => isSameDay(new Date(show.startTime), selectedDate))
      .filter((show) => new Date(show.startTime) > new Date())
      .sort((a, b) => compareAsc(new Date(a.startTime), new Date(b.startTime)));
  }, [showtimes, selectedDate]);

  if (loading)
    return (
      <div className="pt-20 px-4 max-w-7xl mx-auto">
        <LoadingSkeleton count={1} height={500} />
      </div>
    );

  if (!movie)
    return (
      <div className="pt-32 text-center min-h-screen bg-neutral-900 text-white">
        <Film size={64} className="mx-auto mb-4 text-neutral-600" />
        <h2 className="text-2xl font-bold text-neutral-400">
          Không tìm thấy thông tin phim
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-red-500 hover:underline"
        >
          Quay lại
        </button>
      </div>
    );

  return (
    <div className="bg-neutral-900 min-h-screen font-body text-neutral-300 pb-20">
      {/* HERO SECTION (Banner + Info) */}
      <div className="relative w-full min-h-[100vh] md:min-h-[600px] overflow-hidden flex items-center">
        {/* Blurred Background */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-xl opacity-30"
          style={{ backgroundImage: `url(${movie.posterUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent" />

        <div className="relative z-10 container mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 pt-28 pb-20 md:py-20 w-full">
          {/* Poster */}
          <div className="relative shrink-0 group">
            <motion.img
              layoutId={`poster-${movie.id}`}
              src={movie.posterUrl}
              alt={movie.title}
              className="w-48 sm:w-56 md:w-72 aspect-[2/3] object-cover rounded-xl shadow-2xl border-2 border-neutral-700 group-hover:border-red-600 transition-colors duration-500 z-10 relative"
            />
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-red-600 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-xl" />
          </div>

          {/* Movie Info */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-2xl text-center md:text-left space-y-4 z-10"
          >
            <motion.h1 variants={fadeUpVariant} className="text-4xl md:text-5xl font-display font-bold text-white uppercase leading-tight">
              {movie.title}
            </motion.h1>

            <motion.div variants={fadeUpVariant} className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm font-medium">
              <span className="px-3 py-1 bg-red-600 text-white rounded text-xs font-bold shadow-lg shadow-red-900/20">
                {movie.status === "active" ? "ĐANG CHIẾU" : "SẮP CHIẾU"}
              </span>
              {movie.ageRating && (
                <span className={`px-2 py-1 rounded text-xs font-bold text-white border ${movie.ageRating.includes('18') ? 'bg-red-700 border-red-600' : movie.ageRating.includes('16') ? 'bg-orange-600 border-orange-500' : 'bg-green-600 border-green-500'}`}>
                  {movie.ageRating}
                </span>
              )}
              <span className="flex items-center gap-1 bg-neutral-800 px-3 py-1 rounded border border-neutral-700">
                <Clock size={14} className="text-red-500" /> {movie.duration}{" "}
                phút
              </span>
              <span className="flex items-center gap-1 bg-neutral-800 px-3 py-1 rounded border border-neutral-700">
                <Star size={14} className={movie.averageRating > 0 ? "text-yellow-400 fill-yellow-400" : "text-neutral-500"} />
                {movie.averageRating > 0 ? (
                  <>
                    <span className="font-bold text-white">{movie.averageRating.toFixed(1)}</span>
                    <span className="text-neutral-500 text-xs">/ 5</span>
                  </>
                ) : (
                  <span className="text-neutral-400 text-xs font-normal">Chưa có đánh giá</span>
                )}
              </span>
            </motion.div>

            <motion.div variants={fadeUpVariant} className="flex flex-wrap gap-2 justify-center md:justify-start">
              {movie.genres?.map((g) => (
                <span
                  key={g.id}
                  className="text-xs border border-neutral-600 px-2 py-0.5 rounded text-neutral-400 hover:text-white hover:border-neutral-400 transition-colors cursor-default"
                >
                  {g.name}
                </span>
              ))}
            </motion.div>

            <motion.div variants={fadeUpVariant} className="pt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button
                onClick={() =>
                  document
                    .getElementById("booking-section")
                    .scrollIntoView({ behavior: "smooth" })
                }
                className="bg-red-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
              >
                <MapPin size={20} /> ĐẶT VÉ NGAY
              </button>

              {movie.trailerUrl && (
                <button
                  onClick={() => setTrailerOpen(true)}
                  className="bg-neutral-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-neutral-700 border border-neutral-700 flex items-center justify-center gap-2 transition-all"
                >
                  <Play size={20} fill="currentColor" /> Xem Trailer
                </button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* MAIN CONTENT (Description + Booking) */}
      <div className="container mx-auto px-4 -mt-10 relative z-20 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="space-y-8"
        >
          {/* Description */}
          <section className="bg-neutral-800/50 p-6 md:p-8 rounded-2xl border border-neutral-800 backdrop-blur-sm">
            <h3 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
              <Info size={20} className="text-red-500" /> NỘI DUNG PHIM
            </h3>
            <p className="leading-relaxed text-neutral-400 text-justify text-base">
              {movie.description || "Chưa cập nhật nội dung cho phim này."}
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-neutral-800">
              <div>
                <p className="text-neutral-500 text-xs uppercase font-bold mb-1">
                  Đạo diễn
                </p>
                <p className="text-white font-medium">
                  {movie.director || "Chưa cập nhật"}
                </p>
              </div>
              <div>
                <p className="text-neutral-500 text-xs uppercase font-bold mb-1">
                  Diễn viên
                </p>
                <p className="text-white font-medium line-clamp-2">
                  {movie.actors?.map((a) => a.name).join(", ") ||
                    "Chưa cập nhật"}
                </p>
              </div>
            </div>
          </section>

          {/* Booking Section */}
          <section
            id="booking-section"
            className="bg-neutral-800 p-6 md:p-8 rounded-2xl border border-neutral-700 shadow-xl"
          >
            <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2 border-l-4 border-red-600 pl-3">
              <Calendar size={20} className="text-red-500" /> LỊCH CHIẾU
            </h3>

            {availableDates.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-neutral-700 rounded-lg bg-neutral-900/50">
                <p className="text-neutral-500">
                  Hiện tại chưa có lịch chiếu cho phim này.
                </p>
              </div>
            ) : (
              <>
                <div className="flex gap-3 overflow-x-auto pb-4 mb-6 custom-scrollbar">
                  {availableDates.map((date) => {
                    const isSelected = isSameDay(date, selectedDate);
                    return (
                      <button
                        key={date.toString()}
                        onClick={() => setSelectedDate(date)}
                        className={`flex flex-col items-center min-w-[90px] p-3 rounded-xl border transition-all ${isSelected
                          ? "bg-red-600 border-red-500 text-white shadow-lg scale-105"
                          : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-600"
                          }`}
                      >
                        <span className="text-xs font-bold uppercase">
                          {format(date, "EEE", { locale: vi })}
                        </span>
                        <span className="text-xl font-bold">
                          {format(date, "dd/MM")}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {showtimesOnDate.map((show) => (
                    <button
                      key={show.id}
                      onClick={() => navigate(`/booking/${show.id}`)}
                      className="group relative bg-neutral-900 border border-neutral-700 p-4 rounded-lg hover:border-red-500 hover:bg-neutral-800 transition-all text-center"
                    >
                      <div className="text-xl font-bold text-white group-hover:text-red-500 font-display transition-colors">
                        {format(new Date(show.startTime), "HH:mm")}
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-1 uppercase truncate">
                        {show.room?.name || "Rạp thường"}
                      </div>
                      <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        Đặt vé
                      </div>
                    </button>
                  ))}
                </div>

                {showtimesOnDate.length === 0 && (
                  <p className="text-center text-neutral-500 py-4 italic">
                    Không còn suất chiếu nào trong ngày hôm nay.
                  </p>
                )}
              </>
            )}
          </section>
          <ReviewSection movieId={id} />
        </motion.div>


      </div>
      {/* Trailer Modal */}
      {trailerOpen && movie?.trailerUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setTrailerOpen(false)}
        >
          <div
            className="bg-neutral-900 rounded-2xl border border-neutral-700 w-full max-w-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
              <h3 className="font-display font-bold text-white uppercase tracking-wide text-sm">
                TRAILER — {movie.title}
              </h3>
              <button
                onClick={() => setTrailerOpen(false)}
                className="text-neutral-400 hover:text-white transition-colors p-1 rounded-full hover:bg-neutral-800"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>
            {/* Video Player — key thay đổi khi mở/đóng để reset trạng thái */}
            <div className="p-1">
              <TrailerPlayer
                key={trailerOpen ? "open" : "closed"}
                trailerUrl={movie.trailerUrl}
                title={movie.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetail;
