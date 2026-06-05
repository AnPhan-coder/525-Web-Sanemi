import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { movieService } from "../../../services/movieService";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Ticket, Calendar, ChevronRight, Play, Info, Star } from "lucide-react";
import { useApiCall } from "../../../hooks/useApiCall";
import { LoadingSkeleton } from "../common/LoadingSpinner";
import TrailerModal from "../common/TrailerModal";

const HomePage = () => {
  const navigate = useNavigate();

  const [activeMovies, setActiveMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const [trailerMovie, setTrailerMovie] = useState(null);

  const { loading, execute } = useApiCall();

  useEffect(() => {
    const fetchData = async () => {
      await execute(() => movieService.getMovies(), {
        onSuccess: (res) => {
          const data = res.data.result || res.data;
          setActiveMovies(data.filter((m) => m.status === "active"));
          setUpcomingMovies(data.filter((m) => m.status === "upcoming"));
        },
        showSuccessToast: false,
      });
    };
    fetchData();
  }, []);

  const handleViewAll = (status) => {
    navigate(`/movies?status=${status}`);
  };

  const handleMovieClick = (movieId) => {
    if (!isDragging) {
      navigate(`/movie/${movieId}`);
    }
  };

  const bannerSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    beforeChange: () => setIsDragging(true),
    afterChange: () => setIsDragging(false),
    dotsClass: "slick-dots custom-banner-dots",
  };

  const listSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: false,
    beforeChange: () => setIsDragging(true),
    afterChange: () => setIsDragging(false),
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  const renderMovieCard = (movie, type) => (
    <div key={movie.id} className="px-3 py-4 h-full">
      <div
        className="group relative flex flex-col h-full bg-neutral-800 rounded-xl overflow-hidden border border-neutral-800 hover:border-red-500/50 transition-all duration-300 shadow-sm hover:shadow-red-900/20 cursor-pointer"
        onClick={() => handleMovieClick(movie.id)}
      >
        {/* Ảnh Poster */}
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/300x450?text=No+Image";
            }}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform shadow-lg">
              <Ticket size={20} />
            </div>
          </div>
        </div>

        {/* Nội dung Card */}
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="text-base font-bold text-white line-clamp-1 mb-1 group-hover:text-red-500 transition-colors">
            {movie.title}
          </h3>
          <p className="text-xs text-neutral-400 mb-3 flex items-center gap-2">
            <span className="bg-neutral-700 px-1.5 py-0.5 rounded text-[10px]">
              {movie.duration}p
            </span>
            <span className="flex items-center gap-1 text-yellow-400 font-bold text-[11px]">
              <Star size={12} className="fill-yellow-400" />
              {movie.averageRating > 0 ? movie.averageRating.toFixed(1) : "-"}
            </span>
            <span className="truncate max-w-[100px]">{movie.genres?.[0]?.name || movie.genre || "Chưa cập nhật"}</span>
          </p>

          {/* Quick Action Buttons */}
          <div className="mt-auto pt-2 grid grid-cols-2 gap-2">
            <button
              disabled={!movie.trailerUrl || movie.trailerUrl === "1"} // Kiểm tra xem có trailer không
              title={!movie.trailerUrl || movie.trailerUrl === "1" ? "Chưa có trailer" : "Xem Trailer"}
              onClick={(e) => {
                e.stopPropagation(); // Tránh click xuyên xuống card
                if (movie.trailerUrl && movie.trailerUrl !== "1") setTrailerMovie(movie);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${movie.trailerUrl && movie.trailerUrl !== "1"
                ? "bg-neutral-700 text-white hover:bg-neutral-600"
                : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                }`}
            >
              <Play size={14} /> Trailer
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMovieClick(movie.id);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${type === "active"
                ? "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/20"
                : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600 hover:text-white"
                }`}
            >
              {type === "active" ? "Đặt vé" : <><Info size={14} /> Chi tiết</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <LoadingSkeleton count={3} />;

  return (
    <div className="bg-neutral-900 min-h-screen pb-20 pt-20 font-body">
      <style>{`
        .custom-banner-dots { bottom: 25px !important; }
        .custom-banner-dots li button:before { font-size: 10px !important; color: white !important; opacity: 0.5 !important; }
        .custom-banner-dots li.slick-active button:before { color: #dc2626 !important; opacity: 1 !important; }
      `}</style>

      {/* --- BANNER SECTION --- */}
      <section className="relative mb-16 group">
        {activeMovies.length > 0 && (
          <Slider {...bannerSettings}>
            {activeMovies.slice(0, 5).map((movie) => (
              <div
                key={movie.id}
                className="relative h-[450px] md:h-[600px] w-full outline-none cursor-grab active:cursor-grabbing"
                onClick={() => handleMovieClick(movie.id)}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center blur-sm opacity-40"
                  style={{ backgroundImage: `url(${movie.posterUrl})` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/80 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-transparent to-transparent"></div>

                <div className="absolute inset-0 container mx-auto px-4 flex items-center">
                  <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-6xl mx-auto">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="hidden md:block w-64 rounded-xl shadow-2xl border-2 border-neutral-700 transform group-hover:-translate-y-2 transition-transform duration-500"
                    />

                    <div className="flex-1 text-center md:text-left space-y-4">
                      <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-bold rounded uppercase tracking-wider shadow-lg shadow-red-600/20">
                        Đang chiếu
                      </span>

                      <h2 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight drop-shadow-lg line-clamp-2">
                        {movie.title}
                      </h2>

                      <div className="flex items-center justify-center md:justify-start gap-4 text-neutral-300 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar size={16} className="text-red-500" /> {new Date().getFullYear()}
                        </span>
                        <span>•</span>
                        <span>{movie.duration} phút</span>
                        <span className="flex items-center gap-1 text-yellow-400 font-bold text-base">
                          <Star size={16} className="fill-yellow-400" />
                          {movie.averageRating > 0 ? movie.averageRating.toFixed(1) : "Chưa có đánh giá"}
                        </span>
                      </div>

                      <div className="pt-6">
                        <button
                          className="bg-red-600 text-white px-8 py-3.5 rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30 flex items-center gap-2 mx-auto md:mx-0 text-lg active:scale-95"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMovieClick(movie.id);
                          }}
                        >
                          <Ticket size={20} /> ĐẶT VÉ NGAY
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        )}
      </section>

      {/* --- DANH SÁCH PHIM --- */}
      <div className="space-y-16">
        <section className="container mx-auto px-4" id="phim-dang-chieu">
          <div className="flex items-center justify-between mb-8 px-2 border-b border-neutral-800 pb-4">
            <h2 className="text-2xl font-display font-bold text-white border-l-4 border-red-600 pl-4 uppercase">
              Phim Đang Chiếu
            </h2>
            <button
              onClick={() => handleViewAll("active")}
              className="text-neutral-400 hover:text-red-500 flex items-center gap-1 text-sm font-bold transition-colors group"
            >
              Xem tất cả{" "}
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {activeMovies.length > 0 ? (
            <Slider {...listSettings}>
              {activeMovies.map((movie) => renderMovieCard(movie, "active"))}
            </Slider>
          ) : (
            <div className="text-center py-12 border border-dashed border-neutral-800 rounded-xl mx-2 bg-neutral-800/20">
              <p className="text-neutral-500">Hiện chưa có phim đang chiếu.</p>
            </div>
          )}
        </section>

        <section className="container mx-auto px-4" id="phim-sap-chieu">
          <div className="flex items-center justify-between mb-8 px-2 border-b border-neutral-800 pb-4">
            <h2 className="text-2xl font-display font-bold text-white border-l-4 border-yellow-500 pl-4 uppercase">
              Phim Sắp Chiếu
            </h2>
            <button
              onClick={() => handleViewAll("upcoming")}
              className="text-neutral-400 hover:text-yellow-500 flex items-center gap-1 text-sm font-bold transition-colors group"
            >
              Xem tất cả{" "}
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {upcomingMovies.length > 0 ? (
            <Slider {...listSettings}>
              {upcomingMovies.map((movie) => renderMovieCard(movie, "upcoming"))}
            </Slider>
          ) : (
            <div className="text-center py-12 border border-dashed border-neutral-800 rounded-xl mx-2 bg-neutral-800/20">
              <p className="text-neutral-500">Chưa có phim sắp chiếu.</p>
            </div>
          )}
        </section>
      </div>

      {/* Render Modal Xem Trailer */}
      <TrailerModal
        isOpen={!!trailerMovie}
        onClose={() => setTrailerMovie(null)}
        movie={trailerMovie}
      />
    </div>
  );
};

export default HomePage;