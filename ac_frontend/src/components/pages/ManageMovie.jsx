import React, { useEffect, useState } from "react";
import axios from "axios";
import MovieForm from "./MovieForm";
import Swal from "sweetalert2";
import { useSearchParams } from "react-router-dom";
import { useApiCall } from "../../hooks/useApiCall";
import { LoadingSkeleton } from "./LoadingSpinner";
import { Film, Search, RefreshCcw, Plus, Edit3, Trash2 } from "lucide-react";

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [view, setView] = useState("list");
  const [genres, setGenres] = useState([]);
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  const [searchParams] = useSearchParams();
  const keywordFromUrl = searchParams.get("keyword");

  const [filters, setFilters] = useState({
    keyword: "",
    status: "",
    genreId: "",
  });

  const { loading, execute } = useApiCall();

  useEffect(() => {
    loadGenres();
  }, []);

  useEffect(() => {
    if (keywordFromUrl) {
      setFilters((prev) => ({ ...prev, keyword: keywordFromUrl }));
      loadMoviesWithFilter({ ...filters, keyword: keywordFromUrl });
    } else {
      loadMovies();
    }
  }, [keywordFromUrl]);

  const loadGenres = async () => {
    await execute(() => axios.get("http://localhost:8080/api/genres"), {
      onSuccess: (res) => setGenres(res.data),
      showSuccessToast: false,
    });
  };

  const loadMovies = async () => {
    loadMoviesWithFilter(filters);
  };

  const loadMoviesWithFilter = async (currentFilters) => {
    const params = {};
    if (currentFilters.keyword) params.keyword = currentFilters.keyword;
    if (currentFilters.status) params.status = currentFilters.status;
    if (currentFilters.genreId) params.genreId = currentFilters.genreId;

    await execute(
      () => axios.get("http://localhost:8080/api/movies/search", { params }),
      {
        onSuccess: (res) => setMovies(res.data.result || res.data),
        showSuccessToast: false,
      }
    );
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadMovies();
  };

  const handleReset = () => {
    setFilters({ keyword: "", status: "", genreId: "" });
    loadMoviesWithFilter({ keyword: "", status: "", genreId: "" });
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Xác nhận xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      background: "#171717",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#404040",
      confirmButtonText: "Xóa",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await execute(
          () => axios.delete(`http://localhost:8080/api/movies/${id}`),
          {
            successMessage: "Đã xóa phim thành công!",
            onSuccess: () => loadMovies(),
          }
        );
      }
    });
  };

  if (view === "form") {
    return (
      <MovieForm
        movieId={selectedMovieId}
        onBack={() => {
          setView("list");
          loadMovies();
        }}
      />
    );
  }

  return (
    <div className="p-4 md:p-8 text-white w-full font-body">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-neutral-800 pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tight flex items-center gap-3">
            <span className="p-2 bg-red-600/10 rounded-lg text-red-500 border border-red-600/20">
              <Film size={24} />
            </span>
            Quản Lý Phim
          </h2>
          <p className="text-neutral-500 text-sm mt-1">
            Danh sách phim và trạng thái hiển thị
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedMovieId(null);
            setView("form");
          }}
          className="bg-red-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-red-700 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={20} /> Thêm Phim
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-800 mb-6">
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-3 text-neutral-500"
            />
            <input
              type="text"
              name="keyword"
              placeholder="Tìm tên phim..."
              value={filters.keyword}
              onChange={handleFilterChange}
              className="w-full bg-neutral-900 border border-neutral-700 text-white text-sm pl-10 p-2.5 rounded-lg focus:border-red-500 outline-none"
            />
          </div>

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="bg-neutral-900 border border-neutral-700 text-white text-sm p-2.5 rounded-lg focus:border-red-500 outline-none"
          >
            <option value="">-- Tất cả trạng thái --</option>
            <option value="upcoming">Sắp Chiếu</option>
            <option value="active">Đang Chiếu</option>
            <option value="finished">Ngừng Chiếu</option>
          </select>

          <select
            name="genreId"
            value={filters.genreId}
            onChange={handleFilterChange}
            className="bg-neutral-900 border border-neutral-700 text-white text-sm p-2.5 rounded-lg focus:border-red-500 outline-none"
          >
            <option value="">-- Tất cả thể loại --</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-neutral-700 text-white px-4 py-2 rounded-lg hover:bg-white hover:text-black flex-1 font-bold transition-colors"
            >
              Lọc
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-neutral-800 text-neutral-400 px-4 py-2 rounded-lg hover:bg-neutral-700 border border-neutral-700"
              title="Reset bộ lọc"
            >
              <RefreshCcw size={18} />
            </button>
          </div>
        </form>
      </div>

      {/* TABLE */}
      {loading ? (
        <LoadingSkeleton count={5} />
      ) : (
        <div className="bg-neutral-800/30 rounded-xl border border-neutral-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-900/50 text-neutral-400 text-xs uppercase border-b border-neutral-800">
                  <th className="p-4 font-bold">Poster</th>
                  <th className="p-4 font-bold">Tên Phim</th>
                  <th className="p-4 font-bold">Thông tin</th>
                  <th className="p-4 font-bold">Trạng thái</th>
                  <th className="p-4 font-bold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-neutral-300 divide-y divide-neutral-800">
                {movies.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center p-8 text-neutral-500 italic"
                    >
                      Không tìm thấy phim nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  movies.map((movie) => (
                    <tr
                      key={movie.id}
                      className="hover:bg-neutral-800/50 transition-colors group"
                    >
                      <td className="p-4 w-20">
                        <img
                          src={movie.posterUrl}
                          alt=""
                          className="w-12 h-16 object-cover rounded border border-neutral-700"
                        />
                      </td>
                      <td className="p-4 font-medium text-white max-w-xs">
                        <div className="line-clamp-2">{movie.title}</div>
                      </td>
                      <td className="p-4 text-sm text-neutral-400">
                        <div className="mb-1">{movie.duration} phút</div>
                        <div className="text-xs text-neutral-500">
                          {movie.genres &&
                            movie.genres.map((g) => g.name).join(", ")}
                        </div>
                      </td>
                      <td className="p-4 ">
                        <span
                          className={`line-clamp-2 px-2 py-1 rounded-md text-xs font-bold border ${
                            movie.status === "active"
                              ? "bg-green-500/10 border-green-500/20 text-green-500"
                              : movie.status === "upcoming"
                              ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
                              : "bg-neutral-700 border-neutral-600 text-neutral-400"
                          }`}
                        >
                          {movie.status === "active"
                            ? "ĐANG CHIẾU"
                            : movie.status === "upcoming"
                            ? "SẮP CHIẾU"
                            : "NGỪNG CHIẾU"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() =>
                              setSelectedMovieId(movie.id) || setView("form")
                            }
                            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(movie.id)}
                            className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieList;
