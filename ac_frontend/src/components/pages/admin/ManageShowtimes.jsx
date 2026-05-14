import React, { useEffect, useState, useMemo } from "react";
import { movieService } from "../../../services/movieService";
import { roomService } from "../../../services/roomService";
import { showtimeService } from "../../../services/showtimeService";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { Calendar, Plus, Trash2, Search, Armchair, Film } from "lucide-react";
import ShowtimeForm from "./ShowtimeForm";
import { useApiCall } from "../../../hooks/useApiCall";
import { LoadingSkeleton } from "../common/LoadingSpinner";

const ManageShowtimes = () => {
  const [view, setView] = useState("LIST");
  const [expandedMovieId, setExpandedMovieId] = useState(null);

  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [timeFilter, setTimeFilter] = useState("UPCOMING");

  const { loading: loadingData, execute: fetchData } = useApiCall();
  const { execute: executeDelete } = useApiCall();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await fetchData(
      async () => {
        const [resMovies, resRooms, resShows] = await Promise.all([
          movieService.getMovies(),
          roomService.getRooms(),
          showtimeService.getAdminShowtimes(),
        ]);

        setMovies(resMovies.data.result || resMovies.data || []);
        setRooms(resRooms.data.result || []);
        setShowtimes(resShows.data.result || []);
      },
      { showErrorToast: true }
    );
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Xác nhận xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      background: "#171717",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#404040",
      confirmButtonText: "Xóa ngay",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await executeDelete(
          async () => await showtimeService.deleteShowtime(id),
          {
            successMessage: "Đã xóa suất chiếu thành công!",
            onSuccess: () => loadData(),
          }
        );
      }
    });
  };

  const groupedShowtimes = useMemo(() => {
    const now = new Date();
    const groups = {};
    showtimes.forEach((show) => {
      const movieName = show.movie?.title?.toLowerCase() || "";
      const isNameMatch = searchTerm
        ? movieName.includes(searchTerm.toLowerCase())
        : true;

      const showDate = show.startTime
        ? new Date(show.startTime).toISOString().split("T")[0]
        : null;
      const isDateMatch = searchDate ? showDate === searchDate : true;

      if (searchTerm) {
        if (!isNameMatch) return;
      } else {
        if (!isDateMatch) return;
      }

      const showTime = new Date(show.startTime);
      if (timeFilter === "UPCOMING" && showTime < now) return;
      if (timeFilter === "PAST" && showTime >= now) return;

      const mId = show.movie?.id;
      if (!mId) return;

      if (!groups[mId]) {
        groups[mId] = { movie: show.movie, shows: [] };
      }
      groups[mId].shows.push(show);
    });
    return Object.values(groups);
  }, [showtimes, searchDate, debouncedSearchTerm, searchTerm, timeFilter]);

  if (view === "CREATE") {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen animate-fade-in">
        <ShowtimeForm
          movies={movies}
          rooms={rooms}
          allShowtimes={showtimes}
          onBack={() => setView("LIST")}
          onSuccess={() => {
            setView("LIST");
            loadData();
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 text-white max-w-7xl mx-auto font-body">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-neutral-800 pb-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tight flex items-center gap-3">
            <span className="p-2 bg-red-600/10 rounded-lg text-red-500 border border-red-600/20">
              <Calendar size={24} />
            </span>
            Quản Lý Lịch Chiếu
          </h2>
          <p className="text-neutral-500 text-sm mt-1">
            Sắp xếp và điều chỉnh thời gian chiếu phim
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
          {/* Toggle Sắp tới / Lịch sử */}
          <div className="bg-neutral-900 p-1 rounded-lg flex border border-neutral-800">
            <button
              onClick={() => setTimeFilter("UPCOMING")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                timeFilter === "UPCOMING"
                  ? "bg-green-700/40 text-green-400 border border-green-700/50"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              Sắp tới
            </button>
            <button
              onClick={() => setTimeFilter("PAST")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                timeFilter === "PAST"
                  ? "bg-neutral-700 text-neutral-200 border border-neutral-600"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              Lịch sử
            </button>
          </div>

          <div className="relative group flex-1 md:flex-none">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search
                size={18}
                className="text-neutral-500 group-focus-within:text-red-500 transition-colors"
              />
            </div>
            <input
              type="text"
              placeholder="Tìm phim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 text-white text-sm rounded-lg focus:border-red-500 block w-full md:w-56 pl-10 p-2.5 outline-none transition-all placeholder:text-neutral-600"
            />
          </div>

          <div className="relative flex-1 md:flex-none">
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              disabled={searchTerm.length > 0}
              className={`bg-neutral-900 border border-neutral-700 text-white text-sm rounded-lg focus:border-red-500 block w-full p-2.5 outline-none transition-all
                ${
                  searchTerm.length > 0
                    ? "opacity-40 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
            />
          </div>

          <button
            onClick={() => setView("CREATE")}
            className="bg-red-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-yellow-600 flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={20} />{" "}
            <span className="hidden sm:inline">Tạo Lịch</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loadingData ? (
          <LoadingSkeleton count={3} />
        ) : groupedShowtimes.length === 0 ? (
          <div className="text-center py-16 bg-neutral-800/30 rounded-xl border border-dashed border-neutral-700 text-neutral-500">
            <Film size={48} className="mx-auto mb-3 opacity-20" />
            <p>Không tìm thấy lịch chiếu nào phù hợp.</p>
          </div>
        ) : (
          groupedShowtimes.map((group) => (
            <div
              key={group.movie.id}
              className="bg-neutral-800/50 rounded-xl border border-neutral-800 overflow-hidden hover:border-neutral-700 transition-colors"
            >
              <div
                onClick={() =>
                  setExpandedMovieId(
                    expandedMovieId === group.movie.id ? null : group.movie.id
                  )
                }
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-neutral-800 transition-colors select-none"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-16 rounded overflow-hidden bg-neutral-900 border border-neutral-700 shrink-0">
                    <img
                      src={group.movie.posterUrl}
                      alt="poster"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/150";
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-200 line-clamp-1">
                      {group.movie.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                      <span className="bg-neutral-700/50 px-2 py-0.5 rounded text-neutral-300">
                        {group.movie.duration} phút
                      </span>
                      <span>•</span>
                      <span className="text-red-500 font-medium">
                        {group.shows.length} suất chiếu
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`text-neutral-500 transform transition-transform duration-300 ${
                    expandedMovieId === group.movie.id ? "rotate-180" : ""
                  }`}
                >
                  <ChevronDownIcon />
                </div>
              </div>

              {expandedMovieId === group.movie.id && (
                <div className="p-4 bg-neutral-900/30 border-t border-neutral-800">
                  {Object.entries(
                    group.shows.reduce((acc, show) => {
                      const date = show.startTime
                        ? new Date(show.startTime).toISOString().split("T")[0]
                        : null;
                      if (!acc[date]) acc[date] = [];
                      acc[date].push(show);
                      return acc;
                    }, {})
                  )
                    .sort(
                      ([dateA], [dateB]) => new Date(dateA) - new Date(dateB)
                    )
                    .map(([date, showsInDate]) => (
                      <div key={date} className="mb-6 last:mb-0">
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-800">
                          <Calendar size={14} className="text-red-500" />
                          <span className="text-sm font-semibold text-neutral-300">
                            {format(new Date(date), "dd/MM/yyyy")}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {showsInDate
                            .sort(
                              (a, b) =>
                                new Date(a.startTime) - new Date(b.startTime)
                            )
                            .map((show) => (
                              <div
                                key={show.id}
                                className="group relative bg-neutral-800 p-3 rounded-lg border border-neutral-700 hover:border-red-500/50 hover:bg-neutral-800 transition-all"
                              >
                                <div className="flex items-baseline gap-1.5 mb-2">
                                  <span className="text-xl font-bold text-red-500 font-display">
                                    {format(new Date(show.startTime), "HH:mm")}
                                  </span>
                                  <span className="text-[10px] text-neutral-500">
                                    →{" "}
                                    {show.endTime
                                      ? format(new Date(show.endTime), "HH:mm")
                                      : "..."}
                                  </span>
                                </div>

                                <div className="mb-2">
                                  <div
                                    className="text-white text-xs font-medium truncate"
                                    title={show.room.name}
                                  >
                                    {show.room.name}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between mt-auto pt-2 border-t border-neutral-700/50">
                                  <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                                    <Armchair size={10} />
                                    <span>
                                      {show.notBooked || 0}/
                                      {show.totalSeats || 0}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(show.id);
                                  }}
                                  className="absolute -top-2 -right-2 bg-neutral-800 text-neutral-400 hover:text-red-500 hover:bg-neutral-700 border border-neutral-700 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all scale-90 hover:scale-100"
                                  title="Xóa suất chiếu"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ChevronDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export default ManageShowtimes;
