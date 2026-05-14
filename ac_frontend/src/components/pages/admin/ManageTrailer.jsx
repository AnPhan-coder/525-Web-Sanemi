import React, { useEffect, useState, useRef } from "react";
import { Upload, Film, CheckCircle, AlertCircle, Search } from "lucide-react";
import { toast } from "react-toastify";
import { movieService } from "../../../services/movieService";
import { useApiCall } from "../../../hooks/useApiCall";
import TrailerPlayer from "../common/TrailerPlayer";

const MAX_FILE_SIZE_MB = 500;
const ACCEPTED_TYPES = ["video/mp4", "video/webm", "video/ogg"];

const ManageTrailer = () => {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null); // "success" | "error"
  const fileInputRef = useRef(null);

  const { execute } = useApiCall();

  useEffect(() => {
    execute(() => movieService.getMovies(), {
      onSuccess: (res) => setMovies(res.data || []),
      showSuccessToast: false,
    });
  }, []);

  useEffect(() => {
    const movie = movies.find((m) => m.id === Number(selectedMovieId));
    setSelectedMovie(movie || null);
    setFile(null);
    setUploadResult(null);
    setUploadProgress(0);
  }, [selectedMovieId, movies]);

  const handleFileChange = (e) => {
    const picked = e.target.files[0];
    if (!picked) return;

    if (!ACCEPTED_TYPES.includes(picked.type)) {
      alert("Chỉ chấp nhận file mp4, webm, ogg");
      return;
    }
    if (picked.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`File không được vượt quá ${MAX_FILE_SIZE_MB}MB`);
      return;
    }
    setFile(picked);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!file || !selectedMovieId) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload file lên server
      const uploadRes = await movieService.uploadTrailer(formData, (percent) => {
        setUploadProgress(percent);
      });

      const trailerUrl = uploadRes.data?.result;
      if (!trailerUrl) throw new Error("Không lấy được URL trailer");

      // Cập nhật trailerUrl vào phim
      await movieService.updateMovie(selectedMovieId, {
        ...selectedMovie,
        trailerUrl,
        genreIds: selectedMovie.genres?.map((g) => g.id) || [],
        actorIds: selectedMovie.actors?.map((a) => a.id) || [],
      });

      // Cập nhật lại selectedMovie để preview mới
      setSelectedMovie((prev) => ({ ...prev, trailerUrl }));
      setMovies((prev) =>
        prev.map((m) =>
          m.id === Number(selectedMovieId) ? { ...m, trailerUrl } : m
        )
      );

      setUploadResult("success");
      toast.success("✅ Trailer đã được cập nhật thành công!");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      setUploadResult("error");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto text-white font-body">
      <div className="flex items-center gap-3 mb-8 border-b border-neutral-800 pb-6">
        <span className="p-2 bg-red-600/10 rounded-lg text-red-500 border border-red-600/20">
          <Film size={24} />
        </span>
        <div>
          <h2 className="text-2xl font-display font-bold uppercase">Quản lý Trailer</h2>
          <p className="text-neutral-500 text-sm mt-0.5">Upload trailer video cho từng phim</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Chọn phim */}
        <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-5 space-y-4">
          <label className="block text-neutral-300 text-sm font-bold">Chọn phim</label>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm tên phim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:border-red-500 outline-none transition-colors"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
              <Search size={18} />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neutral-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            {filteredMovies.length > 0 ? (
              filteredMovies.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMovieId(String(m.id))}
                  className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 flex justify-between items-center ${
                    selectedMovieId === String(m.id)
                      ? "bg-red-600/20 border-red-500 text-white"
                      : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
                  }`}
                >
                  <span className="font-medium">{m.title}</span>
                  {m.trailerUrl && (
                    <span className="text-[10px] px-2 py-0.5 uppercase tracking-wider bg-neutral-800 border border-neutral-700 rounded text-neutral-400 font-bold">
                      Đã có Trailer
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-neutral-500 text-sm text-center py-4">Không tìm thấy phim phù hợp</p>
            )}
          </div>
        </div>

        {selectedMovie && (
          <>
            {/* Preview trailer hiện tại */}
            <div>
              <p className="text-neutral-400 text-sm font-bold mb-2">
                Trailer hiện tại {!selectedMovie.trailerUrl && "(chưa có)"}
              </p>
              <TrailerPlayer
                key={selectedMovie.trailerUrl || "no-trailer"}
                trailerUrl={selectedMovie.trailerUrl}
                title={selectedMovie.title}
              />
            </div>

            {/* Upload trailer mới */}
            <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-5 space-y-4">
              <p className="text-sm font-bold text-neutral-300">Upload trailer mới</p>
              <p className="text-xs text-neutral-500">
                Định dạng hỗ trợ: mp4, webm, ogg — Tối đa {MAX_FILE_SIZE_MB}MB
              </p>

              <div
                className="border-2 border-dashed border-neutral-700 rounded-lg p-6 text-center cursor-pointer hover:border-red-500/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={28} className="mx-auto mb-2 text-neutral-500" />
                <p className="text-sm text-neutral-400">
                  {file ? (
                    <span className="text-white font-medium">{file.name}</span>
                  ) : (
                    "Kéo thả hoặc click để chọn file"
                  )}
                </p>
                {file && (
                  <p className="text-xs text-neutral-500 mt-1">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES.join(",")}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {isUploading && (
                <div>
                  <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span>Đang upload...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-neutral-700 rounded-full h-1.5">
                    <div
                      className="bg-red-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {uploadResult === "success" && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle size={16} /> Trailer đã được cập nhật thành công!
                </div>
              )}
              {uploadResult === "error" && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle size={16} /> Upload thất bại. Vui lòng thử lại.
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || isUploading}
                className={`w-full py-3 rounded-lg font-bold uppercase tracking-wider transition-all ${
                  file && !isUploading
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-neutral-700 text-neutral-500 cursor-not-allowed"
                }`}
              >
                {isUploading ? "Đang upload..." : "Upload Trailer"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageTrailer;
