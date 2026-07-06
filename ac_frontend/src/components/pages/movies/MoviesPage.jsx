import React, { useEffect, useState } from "react";
import { movieService } from "../../../services/movieService";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, Film, Calendar, Ticket, Play, Info, Star } from "lucide-react";
import { useApiCall } from "../../../hooks/useApiCall";
import { LoadingSkeleton } from "../common/LoadingSpinner";
import TrailerModal from "../common/TrailerModal";

const MoviesPage = () => {
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [searchParams] = useSearchParams();
  const urlKeyword = searchParams.get("keyword");
  const urlStatus = searchParams.get("status");

  const [activeTab, setActiveTab] = useState(urlStatus || "all");
  const [searchTerm, setSearchTerm] = useState(urlKeyword || "");
  const [ageFilter, setAgeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [visibleCount, setVisibleCount] = useState(10);

  // State quản lý Trailer Modal
  const [trailerMovie, setTrailerMovie] = useState(null);

  const { loading, execute } = useApiCall();

  useEffect(() => {
    const fetchMovies = async () => {
      await execute(() => movieService.getMovies(), {
        onSuccess: (res) => {
          const data = res.data.result || res.data;
          setMovies(data);
        },
        showSuccessToast: false
      });
    };
    fetchMovies();
  }, []);

  useEffect(() => {
    if (urlKeyword !== null) setSearchTerm(urlKeyword);
    if (urlStatus === "active" || urlStatus === "upcoming" || urlStatus === "all") setActiveTab(urlStatus);
  }, [urlKeyword, urlStatus]);

  useEffect(() => {
    let result = movies;

    if (activeTab === "active") {
      result = result.filter(m => m.status === "active");
    } else if (activeTab === "upcoming") {
      result = result.filter(m => m.status === "upcoming");
    }

    if (searchTerm) {
      result = result.filter(m =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (ageFilter !== "all") {
      result = result.filter(m => m.ageRating && m.ageRating.trim().toUpperCase() === ageFilter.toUpperCase());
    }

    // Sắp xếp phim
    if (sortBy === "rating") {
      result = [...result].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (sortBy === "sales") {
      result = [...result].sort((a, b) => (b.ticketsSold || 0) - (a.ticketsSold || 0));
    }

    setFilteredMovies(result);
    setVisibleCount(10);
  }, [activeTab, searchTerm, ageFilter, sortBy, movies]);

  const handleMovieClick = (id) => {
    navigate(`/movie/${id}`);
  };

  return (
    <div className="bg-neutral-900 min-h-screen pt-24 pb-12 font-body text-white">
      <div className="max-w-7xl mx-auto px-4">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6 border-b border-neutral-800 pb-6">
          <div>
            <h2 className="text-3xl font-display font-bold uppercase flex items-center gap-3">
              <span className="p-2 bg-red-600/10 rounded-lg text-red-500 border border-red-600/20">
                <Film size={28} />
              </span>
              Kho Phim
            </h2>
            <p className="text-neutral-400 mt-2">Khám phá thế giới điện ảnh đặc sắc</p>
          </div>

          {/* Search & Filter Tool */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="bg-neutral-800 p-1 rounded-lg flex">
              {[
                { id: "all", label: "Tất cả" },
                { id: "active", label: "Đang chiếu" },
                { id: "upcoming", label: "Sắp chiếu" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === tab.id
                    ? "bg-red-600 text-white shadow-lg"
                    : "text-neutral-400 hover:text-white"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Bộ lọc độ tuổi */}
            <select
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 text-white text-sm rounded-lg focus:border-red-500 block p-2.5 outline-none transition-all cursor-pointer font-bold"
            >
              <option value="all">Phân loại: Tất cả</option>
              <option value="P">P</option>
              <option value="K">K</option>
              <option value="T13">T13</option>
              <option value="T16">T16</option>
              <option value="T18">T18</option>
            </select>

            {/* Sắp xếp phim */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 text-white text-sm rounded-lg focus:border-red-500 block p-2.5 outline-none transition-all cursor-pointer font-bold"
            >
              <option value="default">Sắp xếp: Mặc định</option>
              <option value="rating">Đánh giá cao nhất</option>
              <option value="sales">Mua nhiều nhất</option>
            </select>

            {/* Search Input */}
            <div className="relative group">
              <Search size={18} className="absolute left-3 top-3 text-neutral-500 group-focus-within:text-red-500 transition-colors" />
              <input
                type="text"
                placeholder="Tìm tên phim..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-neutral-800 border border-neutral-700 text-white text-sm rounded-lg focus:border-red-500 block pl-10 p-2.5 w-full md:w-64 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Movie Grid */}
        {loading ? (
          <LoadingSkeleton count={4} />
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-20 bg-neutral-800/30 rounded-xl border border-dashed border-neutral-700">
            <Film size={48} className="mx-auto mb-3 text-neutral-600" />
            <p className="text-neutral-400">
              Không tìm thấy phim nào phù hợp với từ khóa "{searchTerm}".
            </p>
            <button
              onClick={() => { setSearchTerm(""); setActiveTab("all"); setAgeFilter("all"); setSortBy("default"); }}
              className="mt-4 text-red-500 font-bold hover:underline"
            >
              Xem tất cả phim
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredMovies.slice(0, visibleCount).map((movie) => (
                // Bỏ thẻ Link, đổi thành div để các nút bên trong hoạt động đúng chuẩn HTML
                <div
                  key={movie.id}
                  onClick={() => handleMovieClick(movie.id)}
                  className="group relative bg-neutral-800 flex flex-col rounded-xl overflow-hidden border border-neutral-800 hover:border-red-500/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-lg"
                >
                  {/* Poster */}
                  <div className="aspect-2/3 overflow-hidden relative">
                    {movie.ageRating && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold text-white border shadow-md ${movie.ageRating.includes('18') ? 'bg-red-700 border-red-600' : movie.ageRating.includes('16') ? 'bg-orange-600 border-orange-500' : 'bg-green-600 border-green-500'}`}>
                          {movie.ageRating}
                        </span>
                      </div>
                    )}
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => e.target.src = "https://via.placeholder.com/300x450?text=No+Image"}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 transform scale-0 group-hover:scale-100 transition-transform">
                        <Ticket size={16} /> Mua Vé
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 flex-grow flex flex-col">
                    <h3 className="font-bold text-white line-clamp-1 group-hover:text-red-500 transition-colors" title={movie.title}>
                      {movie.title}
                    </h3>
                    <div className="flex items-center justify-between mt-2 mb-3 text-xs text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {movie.duration}p
                      </span>
                      <span className="flex items-center gap-0.5 text-yellow-400 font-bold text-[11px]">
                        <Star size={12} className="fill-yellow-400" />
                        {movie.averageRating > 0 ? movie.averageRating.toFixed(1) : "-"}
                      </span>
                      {movie.ticketsSold !== undefined && movie.ticketsSold > 0 && (
                        <span className="text-[10px] text-red-500 font-semibold bg-red-500/10 px-1.5 py-0.5 rounded" title={`${movie.ticketsSold} đã bán`}>
                          {movie.ticketsSold} Lượt
                        </span>
                      )}

                      <span className={`px-2 py-0.5 rounded ${movie.status === 'active' ? 'text-red-500 bg-red-500/10' : 'text-yellow-500 bg-yellow-500/10'
                        }`}>
                        {movie.status === 'active' ? 'Đang chiếu' : 'Sắp chiếu'}
                      </span>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="mt-auto pt-2 grid grid-cols-2 gap-2 border-t border-neutral-700/50">
                      <button
                        disabled={!movie.trailerUrl || movie.trailerUrl === "1"}
                        title={!movie.trailerUrl || movie.trailerUrl === "1" ? "Chưa có trailer" : "Xem Trailer"}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (movie.trailerUrl && movie.trailerUrl !== "1") setTrailerMovie(movie);
                        }}
                        className={`flex items-center justify-center gap-1 py-1.5 rounded text-[10px] sm:text-xs font-bold uppercase transition-all ${movie.trailerUrl && movie.trailerUrl !== "1"
                          ? "bg-neutral-700 text-white hover:bg-neutral-600"
                          : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                          }`}
                      >
                        <Play size={12} /> Trailer
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMovieClick(movie.id);
                        }}
                        className="flex items-center justify-center gap-1 py-1.5 rounded text-[10px] sm:text-xs font-bold uppercase bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white transition-all"
                      >
                        <Info size={12} /> Chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {visibleCount < filteredMovies.length && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setVisibleCount(prev => prev + 10)}
                  className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-lg border border-neutral-700 transition-all uppercase tracking-wider text-xs shadow-md"
                >
                  Xem thêm phim
                </button>
              </div>
            )}
          </>
        )}

        {/* Render Modal Xem Trailer */}
        <TrailerModal
          isOpen={!!trailerMovie}
          onClose={() => setTrailerMovie(null)}
          movie={trailerMovie}
        />
      </div>
    </div>
  );
};

export default MoviesPage;