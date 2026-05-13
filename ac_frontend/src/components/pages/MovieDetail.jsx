import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
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
} from "lucide-react";

import { useApiCall } from "../../hooks/useApiCall";
import { LoadingSkeleton } from "./LoadingSpinner";
import ReviewSection from "../ReviewSection";

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const { loading, execute } = useApiCall();

  useEffect(() => {
    fetchMovieData();
  }, [id]);

  const fetchMovieData = async () => {
    await execute(
      async () => {
        const [movieRes, showRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/movies/${id}`),
          axios.get(`http://localhost:8080/api/showtimes/movie?movieId=${id}`),
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
      <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
        {/* Blurred Background */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-xl opacity-30"
          style={{ backgroundImage: `url(${movie.posterUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent" />

        <div className="absolute inset-0 container mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 pt-20">
          {/* Poster */}
          <div className="relative shrink-0 group">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-64 md:w-80 rounded-xl shadow-2xl border-2 border-neutral-700 group-hover:border-red-600 transition-colors duration-500 z-10 relative"
            />
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-red-600 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-xl" />
          </div>

          {/* Movie Info */}
          <div className="max-w-2xl text-center md:text-left space-y-4 z-10">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white uppercase leading-tight">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm font-medium">
              <span className="px-3 py-1 bg-red-600 text-white rounded text-xs font-bold shadow-lg shadow-red-900/20">
                {movie.status === "active" ? "ĐANG CHIẾU" : "SẮP CHIẾU"}
              </span>
              <span className="flex items-center gap-1 bg-neutral-800 px-3 py-1 rounded border border-neutral-700">
                <Clock size={14} className="text-red-500" /> {movie.duration}{" "}
                phút
              </span>
            </div>

            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {movie.genres?.map((g) => (
                <span
                  key={g.id}
                  className="text-xs border border-neutral-600 px-2 py-0.5 rounded text-neutral-400 hover:text-white hover:border-neutral-400 transition-colors cursor-default"
                >
                  {g.name}
                </span>
              ))}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
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
                <a
                  href={movie.trailerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-neutral-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-neutral-700 border border-neutral-700 flex items-center justify-center gap-2 transition-all"
                >
                  <Play size={20} fill="currentColor" /> Xem Trailer
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT (Description + Booking) */}
      <div className="container mx-auto px-4 -mt-10 relative z-20 max-w-5xl">
        <div className="space-y-8">
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
                        className={`flex flex-col items-center min-w-[90px] p-3 rounded-xl border transition-all ${
                          isSelected
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
          <div className="container mx-auto px-4 max-w-5xl">
                <ReviewSection movieId={id} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
