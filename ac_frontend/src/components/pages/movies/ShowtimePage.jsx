import React, { useEffect, useState, useMemo } from "react";
import { showtimeService } from "../../../services/showtimeService";
import { format, addDays, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar, Clock, MapPin } from "lucide-react";
import { useApiCall } from "../../../hooks/useApiCall";
import { LoadingSkeleton } from "../common/LoadingSpinner";
import { Link } from "react-router-dom";

const ShowtimePage = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { loading, execute } = useApiCall();

  const next7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));
  }, []);

  useEffect(() => {
    const fetchShowtimes = async () => {
      await execute(() => showtimeService.getShowtimes(), {
        onSuccess: (res) => {
          setShowtimes(res.data.result || res.data);
        },
        showSuccessToast: false,
      });
    };
    fetchShowtimes();
  }, []);

  const moviesOnDate = useMemo(() => {
    const groups = {};

    showtimes.forEach((show) => {
      const showDate = new Date(show.startTime);
      if (!isSameDay(showDate, selectedDate)) return;

      if (new Date() > showDate) return;

      const movieId = show.movie?.id;
      if (!movieId) return;

      if (!groups[movieId]) {
        groups[movieId] = {
          info: show.movie,
          shows: [],
        };
      }
      groups[movieId].shows.push(show);
    });

    return Object.values(groups);
  }, [showtimes, selectedDate]);

  return (
    <div className="bg-neutral-900 min-h-screen pt-24 pb-12 font-body text-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-display font-bold text-white uppercase mb-2">
            Lịch Chiếu Phim
          </h2>
          <p className="text-neutral-400">
            Cập nhật lịch chiếu mới nhất tại Sanemi
          </p>
        </div>

        {/* Date Selector (Thanh chọn ngày) */}
        <div className="flex justify-center mb-10 overflow-x-auto pb-4 no-scrollbar">
          <div className="flex gap-3 bg-neutral-800/50 p-2 rounded-xl border border-neutral-800">
            {next7Days.map((date, index) => {
              const isActive = isSameDay(date, selectedDate);
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center justify-center w-20 h-20 rounded-lg transition-all border-2 ${
                    isActive
                      ? "bg-red-600 border-red-500 text-white shadow-lg scale-105"
                      : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white"
                  }`}
                >
                  <span className="text-xs uppercase font-bold">
                    {format(date, "EEEE", { locale: vi })}
                  </span>
                  <span className="text-2xl font-display font-bold">
                    {format(date, "dd")}
                  </span>
                  <span className="text-xs opacity-70">
                    {format(date, "MM")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSkeleton count={3} />
        ) : moviesOnDate.length === 0 ? (
          <div className="text-center py-16 bg-neutral-800/30 rounded-xl border border-dashed border-neutral-700">
            <Calendar size={48} className="mx-auto mb-3 text-neutral-600" />
            <p className="text-neutral-400">
              Chưa có lịch chiếu nào cho ngày này.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {moviesOnDate.map((group) => (
              <div
                key={group.info.id}
                className="bg-neutral-800 rounded-xl overflow-hidden border border-neutral-800 flex flex-col md:flex-row"
              >
                {/* Poster bên trái */}
                <div className="md:w-48 h-64 md:h-auto shrink-0 relative">
                  <img
                    src={group.info.posterUrl}
                    alt={group.info.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Thông tin & Các suất chiếu */}
                <div className="p-6 flex-1 flex flex-col justify-center">
                  <h3 className="text-2xl font-display font-bold text-white mb-2">
                    {group.info.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-neutral-400 mb-6">
                    <span className="bg-neutral-700 px-2 py-0.5 rounded text-white text-xs">
                      {group.info.duration} phút
                    </span>
                    <span>
                      {group.info.genres?.map((g) => g.name).join(", ")}
                    </span>
                  </div>

                  {/* List giờ chiếu */}
                  <div>
                    <p className="text-sm font-bold text-neutral-300 mb-3 flex items-center gap-2">
                      <Clock size={16} className="text-red-500" /> Chọn suất
                      chiếu:
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {group.shows
                        .sort(
                          (a, b) =>
                            new Date(a.startTime) - new Date(b.startTime)
                        )
                        .map((show) => (
                          <Link
                            key={show.id}
                            to={`/booking/${show.id}`} 
                            className="group flex flex-col items-center bg-neutral-900 border border-neutral-700 hover:border-red-500 hover:bg-neutral-800 rounded-lg px-4 py-2 transition-all min-w-[100px]"
                          >
                            <span className="text-lg font-bold text-white group-hover:text-red-500 transition-colors">
                              {format(new Date(show.startTime), "HH:mm")}
                            </span>
                            <span className="text-[10px] text-neutral-500 uppercase mt-0.5">
                              {show.room?.name || "Rạp 1"}
                            </span>
                          </Link>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowtimePage;
