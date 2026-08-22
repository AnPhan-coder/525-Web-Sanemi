import React, { useEffect, useState, useRef } from "react";
import { Upload, Film, CheckCircle, AlertCircle, Search, Sparkles } from "lucide-react";
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
  const [isGeneratingVoiceover, setIsGeneratingVoiceover] = useState(false);
  const [selectedLang, setSelectedLang] = useState("vi");
  const [playerVersion, setPlayerVersion] = useState(0);
  const [previewTrailer, setPreviewTrailer] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
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
    setPlayerVersion(0);
    setPreviewTrailer(null);
  }, [selectedMovieId, movies]);

  const handleGenerateVoiceover = async () => {
    if (!selectedMovieId) return;

    setIsGeneratingVoiceover(true);
    setPreviewTrailer(null);
    try {
      const res = await movieService.generateVoiceover(selectedMovieId, selectedLang);
      const result = res.data?.result;
      if (!result || !result.trailerUrl) {
        throw new Error("Không nhận được thuyết minh mới");
      }

      setPreviewTrailer(result);
      toast.success("✅ Tạo thuyết minh nháp thành công! Hãy xem thử ở dưới trước khi lưu.");
    } catch (err) {
      console.error(err);
      toast.error("❌ Tạo thuyết minh thất bại: " + (err.response?.data?.message || err.message));
    } finally {
      setIsGeneratingVoiceover(false);
    }
  };

  const handleConfirmSave = async () => {
    if (!selectedMovieId || !previewTrailer) return;

    setIsSaving(true);
    try {
      await movieService.confirmTrailer(selectedMovieId, previewTrailer.trailerUrl, previewTrailer.languageName);
      toast.success(`✅ Đã lưu bản thuyết minh (${previewTrailer.languageName}) vào cơ sở dữ liệu!`);
      setPreviewTrailer(null);
      setPlayerVersion((v) => v + 1);
    } catch (err) {
      console.error(err);
      toast.error("❌ Không thể lưu bản thuyết minh: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelPreview = () => {
    setPreviewTrailer(null);
    toast.info("Đã hủy bản lồng tiếng nháp.");
  };

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
                  className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 flex justify-between items-center ${selectedMovieId === String(m.id)
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
                key={`${selectedMovie.id}_${playerVersion}`}
                movieId={selectedMovie.id}
                trailerUrl={selectedMovie.trailerUrl}
                title={selectedMovie.title}
              />
            </div>

            {/* AI Voiceover Generator */}
            {selectedMovie.trailerUrl && (
              <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-5 space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles size={16} className="text-amber-400 animate-pulse" />
                      Tạo Thuyết Minh Tự Động
                    </h4>
                    <p className="text-xs text-neutral-500 mt-1 max-w-lg">
                      Gemini sẽ viết kịch bản tóm tắt hấp dẫn bằng ngôn ngữ được chọn, sau đó Google TTS và FFmpeg sẽ tự động lồng tiếng tương ứng và giảm nhạc nền trailer .
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <select
                      value={selectedLang}
                      onChange={(e) => setSelectedLang(e.target.value)}
                      className="bg-neutral-900 border border-neutral-700 text-white text-xs rounded-lg p-2.5 outline-none focus:border-red-500 transition-all cursor-pointer"
                    >
                      <option value="vi">Tiếng Việt</option>
                      <option value="zh">Tiếng Trung</option>
                      <option value="ja">Tiếng Nhật</option>
                      <option value="en">Tiếng Anh</option>
                    </select>

                    <button
                      onClick={handleGenerateVoiceover}
                      disabled={isGeneratingVoiceover}
                      className="flex-1 md:flex-none px-5 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider disabled:from-neutral-700 disabled:to-neutral-800 disabled:text-neutral-500 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-red-900/20 active:scale-95 whitespace-nowrap"
                    >
                      {isGeneratingVoiceover ? (
                        <>
                          <div className="animate-spin rounded-full h-4.5 w-4.5 border-t-2 border-white" />
                          Đang xử lý video...
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          Tạo lồng tiếng
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Newly generated preview card */}
            {previewTrailer && (
              <div className="bg-amber-600/10 border border-amber-500/30 rounded-xl p-5 space-y-4">
                <p className="text-amber-400 text-sm font-bold flex items-center gap-2">
                  <Sparkles size={16} />
                  Xem trước bản lồng tiếng mới ({previewTrailer.languageName})
                </p>

                <TrailerPlayer
                  key="preview-player"
                  trailerUrl={previewTrailer.trailerUrl}
                  title={`${selectedMovie.title} - Preview`}
                />

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleCancelPreview}
                    disabled={isSaving}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-bold uppercase transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleConfirmSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-neutral-900 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-1.5"
                  >
                    {isSaving ? "Đang lưu..." : "Xác nhận Lưu"}
                  </button>
                </div>
              </div>
            )}

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
                className={`w-full py-3 rounded-lg font-bold uppercase tracking-wider transition-all ${file && !isUploading
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
