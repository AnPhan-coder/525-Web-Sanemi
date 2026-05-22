import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import reviewApi from "../../api/reviewApi";
import { MessageCircle, Star, Film, Search,ChevronDown, X } from "lucide-react";
import { useApiCall } from "../../hooks/useApiCall";
import { LoadingSkeleton } from "../pages/common/LoadingSpinner";

const CommunityPage = () => {
  const [reviews, setReviews] = useState([]);
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { loading, execute } = useApiCall();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMovies = movies.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const selectedMovieData = movies.find(m => m.id.toString() === selectedMovie.toString());

  useEffect(() => {
    axiosClient.get("/movies").then(res => {
      setMovies(res.data.result || res.data || []);
    });
  }, []);

  // Load Reviews
  useEffect(() => {
    loadCommunityReviews(0);
  }, [selectedMovie]);

  const loadCommunityReviews = async (pageNumber) => {
    await execute(
      () => reviewApi.getCommunityReviews({
        page: pageNumber,
        size: 12,
        ...(selectedMovie && { movieId: selectedMovie })
      }),
      {
        onSuccess: (res) => {
          const pageData = res.data.result;
          setReviews(pageData.content);
          setTotalPages(pageData.totalPages);
          setPage(pageData.number);
        },
        showSuccessToast: false
      }
    );
  };

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={14}
        fill="currentColor"
        className={rating >= star ? 'text-yellow-500' : 'text-neutral-700'}
      />
    ));
  };

  return (
    <div className="bg-neutral-900 min-h-screen pt-24 pb-12 font-body text-white">
      <div className="max-w-7xl mx-auto px-4">

        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6 border-b border-neutral-800 pb-6">
          <div>
            <h2 className="text-3xl font-display font-bold uppercase flex items-center gap-3">
              <span className="p-2 bg-red-600/10 rounded-lg text-red-500 border border-red-600/20">
                <MessageCircle size={28} />
              </span>
              Cộng Đồng
            </h2>
            <p className="text-neutral-400 mt-2">Góc nhìn chân thực từ khán giả</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Film size={20} className="text-neutral-500 hidden sm:block" />
            
            <div className="relative w-full md:w-72 z-50">
              
              <div className="relative z-50">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                
                <input
                  type="text"
                  placeholder="Tìm hoặc chọn phim..."
                  // Đang mở thì hiện text đang gõ, đóng thì hiện tên phim đã chọn
                  value={isSearchOpen ? searchTerm : (selectedMovieData ? selectedMovieData.title : "")}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (!isSearchOpen) setIsSearchOpen(true);
                    if (selectedMovie) setSelectedMovie("");
                  }}
                  onClick={() => setIsSearchOpen(true)}
                  className="w-full bg-neutral-800 border border-neutral-700 text-white text-sm rounded-lg pl-10 pr-10 py-3 focus:border-red-500 outline-none transition-colors cursor-text"
                />

                {selectedMovie && !isSearchOpen ? (
                  <button
                    onClick={() => {
                      setSelectedMovie("");
                      setSearchTerm("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                ) : (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown size={16} className={`text-neutral-500 transition-transform duration-200 ${isSearchOpen ? "rotate-180" : ""}`} />
                  </div>
                )}
              </div>

              {isSearchOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchTerm(""); // reset tìm kiếm khi đóng
                    }}
                  />
                  
                  <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-800 border border-neutral-700 rounded-lg shadow-2xl overflow-hidden z-50">
                    <ul className="max-h-60 overflow-y-auto custom-scrollbar">
                      <li
                        onClick={() => {
                          setSelectedMovie("");
                          setIsSearchOpen(false);
                          setSearchTerm("");
                        }}
                        className={`p-3 text-sm cursor-pointer transition-colors ${!selectedMovie ? "bg-red-600/20 text-red-500 font-bold" : "text-neutral-300 hover:bg-neutral-700 hover:text-white"}`}
                      >
                         Tất cả phim 
                      </li>

                      {filteredMovies.map(m => (
                        <li
                          key={m.id}
                          onClick={() => {
                            setSelectedMovie(m.id.toString());
                            setIsSearchOpen(false);
                            setSearchTerm(""); 
                          }}
                          className={`p-3 text-sm cursor-pointer transition-colors ${selectedMovie === m.id.toString()
                              ? "bg-red-600/20 text-red-500 font-bold border-l-2 border-red-500"
                              : "text-neutral-300 hover:bg-neutral-700 hover:text-white"
                            }`}
                        >
                          {m.title}
                        </li>
                      ))}

                      {filteredMovies.length === 0 && (
                        <li className="p-4 text-sm text-neutral-500 italic text-center">
                          Không tìm thấy phim phù hợp.
                        </li>
                      )}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Grid Reviews */}
        {loading ? (
          <LoadingSkeleton count={4} />
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 bg-neutral-800/30 rounded-xl border border-dashed border-neutral-700">
            <MessageCircle size={48} className="mx-auto mb-3 text-neutral-600" />
            <p className="text-neutral-400">Chưa có đánh giá nào cho danh mục này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rv) => (
              <div key={rv.id} className="bg-neutral-800 rounded-xl p-5 border border-neutral-700 flex flex-col transition-all hover:-translate-y-1 hover:border-neutral-500 shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center font-bold text-neutral-300">
                      {(rv.userName || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{rv.userName || "Thành viên"}</h4>
                      <span className="text-[10px] text-neutral-500">{rv.createdAt}</span>
                    </div>
                  </div>
                  {rv.rating > 0 && (
                    <div className="flex gap-0.5 bg-neutral-900 px-2 py-1 rounded-full border border-neutral-700">
                      {renderStars(rv.rating)}
                    </div>
                  )}
                </div>

                <p className="text-neutral-300 text-sm flex-1 mb-4 italic line-clamp-4">
                  "{rv.content || "Chỉ chấm điểm sao, không để lại bình luận."}"
                </p>

                <Link
                  to={`/movie/${rv.movieId}`}
                  className="mt-auto pt-4 border-t border-neutral-700/50 flex items-center gap-3 group"
                >
                  <img src={rv.moviePoster} alt="" className="w-8 h-10 object-cover rounded border border-neutral-600" />
                  <span className="text-xs font-bold text-neutral-400 group-hover:text-red-500 transition-colors truncate">
                    {rv.movieTitle}
                  </span>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => loadCommunityReviews(i)}
                className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${page === i
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default CommunityPage;