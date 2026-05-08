import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  CheckCircle2,
  Film,
  CalendarDays,
  Clock,
} from "lucide-react";
import { useApiCall } from "../../hooks/useApiCall";
import { showtimeService } from "../../services/showtimeService";

const ShowtimeForm = ({ movies, rooms, allShowtimes, onBack, onSuccess }) => {
  const { loading, execute } = useApiCall();

  const [formData, setFormData] = useState({
    movieId: "",
    roomId: "",
    startTime: "",
    basePrice: 75000,
    isAutoGenerate: false,
  });

  const [calculatedEndTime, setCalculatedEndTime] = useState("");
  const [selectedMovieDuration, setSelectedMovieDuration] = useState(0);

  const [viewMode, setViewMode] = useState("MOVIE");

  const minDateTime = useMemo(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now - offset).toISOString().slice(0, 16);
    return localISOTime;
  }, []);

  const displayedShowtimes = useMemo(() => {
    let filtered = [];
    const now = new Date();

    if (viewMode === "MOVIE") {
      if (!formData.movieId) return [];
      filtered = allShowtimes.filter((s) => {
        const isMatchMovie = s.movie.id === Number(formData.movieId);
        const isFuture = new Date(s.startTime) >= now; 
        
        return isMatchMovie && isFuture;
      });
    } else {
      if (!formData.startTime) return [];
      const selectedDate = formData.startTime.split("T")[0];

      filtered = allShowtimes.filter((s) =>
        s.startTime.startsWith(selectedDate)
      );
    }

    return filtered.sort(
      (a, b) => new Date(b.startTime) - new Date(a.startTime)
    );
  }, [viewMode, formData.movieId, formData.startTime, allShowtimes]);

  const handleMovieChange = (e) => {
    const mId = e.target.value;
    setFormData({ ...formData, movieId: mId });

    setViewMode("MOVIE");

    const movie = movies.find((m) => m.id === parseInt(mId));
    if (movie) {
      setSelectedMovieDuration(movie.duration);
      calculateEndTime(formData.startTime, movie.duration);
    }
  };

  const handleDateChange = (e) => {
    const val = e.target.value;
    setFormData({ ...formData, startTime: val });

    setViewMode("DATE");

    calculateEndTime(val, selectedMovieDuration);
  };

  const calculateEndTime = (startStr, duration) => {
    if (!startStr || !duration) {
      setCalculatedEndTime("");
      return;
    }
    const endDate = new Date(
      new Date(startStr).getTime() + (duration + 15) * 60000
    );
    setCalculatedEndTime(format(endDate, "HH:mm - dd/MM/yyyy"));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.movieId || !formData.roomId || !formData.startTime) {
      toast.warning("Thiếu thông tin!");
      return;
    }

    await execute(
      () =>
        formData.isAutoGenerate
          ? showtimeService.autoGenerateShowtimes({
              movieId: Number(formData.movieId),
              roomId: Number(formData.roomId),
              startTime: formData.startTime,
              basePrice: Number(formData.basePrice),
            })
          : showtimeService.createShowtime({
              movieId: Number(formData.movieId),
              roomId: Number(formData.roomId),
              startTime: formData.startTime,
              basePrice: Number(formData.basePrice),
            }),
      {
        onSuccess: (res) => {
          const result = res.data?.result;

          if (formData.isAutoGenerate) {
            const createdCount = Array.isArray(result) ? result.length : 0;
            if (createdCount === 0) {
              toast.error(
                "Không thể sinh lịch chiếu nào! (Có thể do trùng giờ hoặc quá giờ đóng cửa)"
              );
              return;
            }

            toast.success(
              `Đã tự động sinh thành công ${createdCount} suất chiếu!`
            );
          } else {
            toast.success("Tạo suất chiếu thành công!");
          }

          if (onSuccess) onSuccess();

          setFormData({ ...formData, startTime: "", isAutoGenerate: false });
          setCalculatedEndTime("");
        },
      }
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-white font-body">
      <div className="lg:col-span-1 bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-xl h-fit">
        <button
          onClick={onBack}
          className="text-neutral-400 hover:text-white mb-6 flex items-center gap-2 text-sm font-bold"
        >
          <ArrowLeft size={18} /> Quay lại
        </button>
        <h2 className="text-xl font-bold font-display text-white mb-6 uppercase border-b border-neutral-700 pb-4">
          Thiết lập Lịch Chiếu
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-neutral-400 text-sm font-bold mb-2">
              Chọn Phim
            </label>
            <select
              className="w-full p-3 bg-neutral-900 border border-neutral-600 rounded-lg text-white focus:border-red-500 outline-none transition-colors"
              onChange={handleMovieChange}
              value={formData.movieId}
            >
              <option value="">-- Chọn Phim --</option>
              {movies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.duration}p)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-neutral-400 text-sm font-bold mb-2">
              Chọn Phòng
            </label>
            <select
              className="w-full p-3 bg-neutral-900 border border-neutral-600 rounded-lg text-white focus:border-red-500 outline-none transition-colors"
              onChange={(e) =>
                setFormData({ ...formData, roomId: e.target.value })
              }
              value={formData.roomId}
            >
              <option value="">-- Chọn Phòng --</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-neutral-400 text-sm font-bold mb-2">
                Bắt đầu
              </label>
              <input
                type="datetime-local"
                min={minDateTime}
                className="w-full p-3 bg-neutral-900 border border-neutral-600 rounded-lg text-white focus:border-red-500 outline-none"
                onChange={handleDateChange}
                value={formData.startTime}
              />
            </div>

            <div>
              <label className="block text-neutral-400 text-sm font-bold mb-2">
                Giá vé
              </label>
              <input
                type="number"
                step="5000"
                min="45000"
                max="200000"
                className="w-full p-3 bg-neutral-900 border border-neutral-600 rounded-lg text-white focus:border-red-500 outline-none font-mono"
                onChange={(e) =>
                  setFormData({ ...formData, basePrice: e.target.value })
                }
                value={formData.basePrice}
              />
            </div>
          </div>

          {/* Hiển thị giờ kết thúc dự kiến */}
          {calculatedEndTime && (
            <div className="bg-neutral-900/50 p-3 rounded border border-dashed border-neutral-600 text-xs flex justify-between">
              <span className="text-neutral-400">
                Kết thúc:{" "}
                <b className="text-red-500 ml-1">{calculatedEndTime}</b>
              </span>
              <span className="text-neutral-500">
                ({selectedMovieDuration}p + 15p dọn)
              </span>
            </div>
          )}

          {/* Checkbox Auto Generate */}
          <div
            onClick={() =>
              setFormData({
                ...formData,
                isAutoGenerate: !formData.isAutoGenerate,
              })
            }
            className={`p-4 rounded-lg border cursor-pointer flex items-center gap-3 transition-colors ${
              formData.isAutoGenerate
                ? "bg-red-900/20 border-red-500"
                : "bg-neutral-900 border-neutral-700"
            }`}
          >
            <div
              className={`w-5 h-5 rounded flex items-center justify-center border ${
                formData.isAutoGenerate
                  ? "bg-red-600 border-red-600 text-white"
                  : "border-neutral-500"
              }`}
            >
              {formData.isAutoGenerate && <CheckCircle2 size={14} />}
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">
                Tự động sinh lịch
              </h4>
              <p className="text-[10px] text-neutral-500">
                Xếp lịch liên tục đến 23:00
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
          >
            {loading
              ? "Đang xử lý..."
              : formData.isAutoGenerate
              ? "TẠO HÀNG LOẠT"
              : "TẠO SUẤT CHIẾU"}
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden flex flex-col h-[600px]">
        {/* HEADER VỚI NAVIGATION TABS */}
        <div className="bg-neutral-900 border-b border-neutral-700">
          <div className="flex">
            <button
              onClick={() => setViewMode("MOVIE")}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                viewMode === "MOVIE"
                  ? "border-red-500 text-red-500 bg-neutral-800"
                  : "border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <Film size={16} /> Theo Phim{" "}
              {viewMode === "MOVIE" && `(${displayedShowtimes.length})`}
            </button>
            <button
              onClick={() => setViewMode("DATE")}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                viewMode === "DATE"
                  ? "border-red-500 text-red-500 bg-neutral-800"
                  : "border-transparent text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <CalendarDays size={16} /> Theo Ngày{" "}
              {viewMode === "DATE" && `(${displayedShowtimes.length})`}
            </button>
          </div>

          <div className="px-4 py-2 text-xs text-neutral-500 bg-neutral-900 text-center border-b border-neutral-800">
            {viewMode === "MOVIE"
              ? formData.movieId
                ? "Đang hiện các suất của phim này (tất cả ngày)"
                : "Hãy chọn phim để xem lịch"
              : formData.startTime
              ? `Lịch chiếu ngày ${formData.startTime.split("T")[0]}`
              : "Hãy chọn ngày bắt đầu để xem lịch rạp"}
          </div>
        </div>

        {/* LIST CONTENT */}
        <div className="p-4 overflow-y-auto space-y-4 custom-scrollbar flex-1">
          {displayedShowtimes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-500 opacity-50">
              <Clock size={40} className="mb-2" />
              <p>Không có suất chiếu nào.</p>
            </div>
          ) : (
            Object.entries(
              displayedShowtimes.reduce((acc, show) => {
                const d = show.startTime.split("T")[0];
                if (!acc[d]) acc[d] = [];
                acc[d].push(show);
                return acc;
              }, {})
            ).map(([date, shows]) => (
              <div key={date}>
                <h4 className="text-sm font-bold text-neutral-400 border-b border-neutral-700 pb-1 mb-2 sticky top-0 bg-neutral-800">
                  {format(new Date(date), "dd/MM/yyyy")}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {shows.map((show) => (
                    <div
                      key={show.id}
                      className={`p-3 rounded border text-xs relative group transition-all ${
                        viewMode === "DATE"
                          ? "bg-neutral-700/50 border-neutral-600"
                          : "bg-neutral-900 border-neutral-700"
                      }`}
                    >
                      <div className="text-white font-bold text-sm mb-1">
                        {format(new Date(show.startTime), "HH:mm")}
                        <span className="text-neutral-500 font-normal mx-1">
                          -
                        </span>
                        {format(new Date(show.endTime), "HH:mm")}
                      </div>

                      <div className="text-neutral-400 flex justify-between items-center">
                        <span>{show.room.name}</span>
                        {viewMode === "DATE" && (
                          <span
                            className="text-[10px] text-yellow-500 font-bold truncate max-w-[80px] ml-2"
                            title={show.movie.title}
                          >
                            {show.movie.title}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowtimeForm;
