import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom"; 
import { Search, Film, Calendar, Ticket } from "lucide-react";
import { useApiCall } from "../../hooks/useApiCall";
import { LoadingSkeleton } from "./LoadingSpinner"; 

const MoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); 
  
  const [searchParams] = useSearchParams();
  const urlKeyword = searchParams.get("keyword");

  const [searchTerm, setSearchTerm] = useState(urlKeyword || "");
  
  const { loading, execute } = useApiCall();

  useEffect(() => {
    const fetchMovies = async () => {
      await execute(() => axios.get("http://localhost:8080/api/movies"), {
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
    if (urlKeyword !== null) {
      setSearchTerm(urlKeyword);
    }
  }, [urlKeyword]);

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

    setFilteredMovies(result);
  }, [activeTab, searchTerm, movies]);

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
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                    activeTab === tab.id 
                      ? "bg-red-600 text-white shadow-lg" 
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

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
              onClick={() => { setSearchTerm(""); setActiveTab("all"); }}
              className="mt-4 text-red-500 font-bold hover:underline"
            >
              Xem tất cả phim
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredMovies.map((movie) => (
              <Link 
                to={`/movie/${movie.id}`} 
                key={movie.id} 
                className="group relative bg-neutral-800 rounded-xl overflow-hidden border border-neutral-800 hover:border-red-500/50 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Poster */}
                <div className="aspect-2/3 overflow-hidden relative">
                  <img 
                    src={movie.posterUrl} 
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => e.target.src = "https://via.placeholder.com/300x450"} 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <span className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 transform scale-0 group-hover:scale-100 transition-transform">
                        <Ticket size={16} /> Mua Vé
                     </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3">
                  <h3 className="font-bold text-white truncate group-hover:text-red-500 transition-colors" title={movie.title}>
                    {movie.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2 text-xs text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {movie.duration}p
                    </span>
                    <span className={`px-2 py-0.5 rounded ${
                        movie.status === 'active' ? 'text-green-500 bg-green-500/10' : 'text-yellow-500 bg-yellow-500/10'
                    }`}>
                        {movie.status === 'active' ? 'Đang chiếu' : 'Sắp chiếu'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoviesPage;