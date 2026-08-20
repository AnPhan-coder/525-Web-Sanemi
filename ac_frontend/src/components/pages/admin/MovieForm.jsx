import React, { useEffect, useState } from "react";
import { movieService } from "../../../services/movieService";
import CreatableSelect from "react-select/creatable";
import { Upload, Link as LinkIcon, Save, ArrowLeft } from "lucide-react";
import { useApiCall } from "../../../hooks/useApiCall";

const MovieForm = ({ movieId, onBack }) => {
  const isEdit = !!movieId;
  const { loading, execute } = useApiCall();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 120,
    director: "",
    trailerUrl: "",
    posterUrl: "",
    status: "upcoming",
    genreIds: [],
    actorIds: [],
    ageRating: "P",
  });

  const [genreOptions, setGenreOptions] = useState([]);
  const [actorOptions, setActorOptions] = useState([]);
  const [posterMode, setPosterMode] = useState("URL");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedActors, setSelectedActors] = useState([]);

  useEffect(() => {
    const initData = async () => {
      await execute(
        async () => {
          const [resGenres, resActors] = await Promise.all([
            movieService.getGenres(),
            movieService.getActors(),
          ]);
          setGenreOptions(
            resGenres.data.map((g) => ({ value: g.id, label: g.name }))
          );
          setActorOptions(
            resActors.data.map((a) => ({ value: a.id, label: a.name }))
          );

          if (isEdit) {
            const resMovie = await movieService.getMovieById(movieId);
            const m = resMovie.data.result;
            setFormData({
              title: m.title,
              description: m.description,
              duration: m.duration,
              director: m.director,
              trailerUrl: m.trailerUrl,
              posterUrl: m.posterUrl,
              status: m.status,
              genreIds: m.genres.map((g) => g.id),
              actorIds: m.actors.map((a) => a.id),
              ageRating: m.ageRating || "P",
            });
            setSelectedGenres(
              m.genres.map((g) => ({ value: g.id, label: g.name }))
            );
            setSelectedActors(
              m.actors.map((a) => ({ value: a.id, label: a.name }))
            );
          }
        },
        { showSuccessToast: false }
      );
    };
    initData();
  }, [movieId, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await execute(
      async () => {
        if (isEdit) await movieService.updateMovie(movieId, formData);
        else await movieService.createMovie(formData);
      },
      {
        successMessage: isEdit
          ? "Cập nhật phim thành công!"
          : "Thêm phim mới thành công!",
        onSuccess: onBack,
      }
    );
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    await execute(
      () => movieService.uploadFile(form),
      {
        onSuccess: (res) => {
          const url = res.result || res.data?.result;
          setFormData((prev) => ({ ...prev, posterUrl: url }));
        },
        successMessage: "Upload ảnh thành công!",
      }
    );
  };

  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#171717",
      borderColor: state.isFocused ? "#DC2626" : "#404040",
      color: "white",
      boxShadow: state.isFocused ? "0 0 0 1px #DC2626" : "none",
      "&:hover": { borderColor: "#DC2626" },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#262626",
      border: "1px solid #404040",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#DC2626" : "#262626",
      color: "white",
      cursor: "pointer",
    }),
    multiValue: (base) => ({ ...base, backgroundColor: "#404040" }),
    multiValueLabel: (base) => ({ ...base, color: "white" }),
    input: (base) => ({ ...base, color: "white" }),
    singleValue: (base) => ({ ...base, color: "white" }),
  };

  return (
    <div className="bg-neutral-800 p-8 rounded-xl border border-neutral-700 max-w-5xl mx-auto shadow-2xl font-body">
      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-neutral-700">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold font-display text-white uppercase tracking-tight">
          {isEdit ? `Chỉnh Sửa Phim` : "Thêm Phim Mới"}
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-12 gap-8"
      >
        <div className="md:col-span-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="text-neutral-400 text-sm font-bold mb-2 block">
                Tên Phim
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full bg-neutral-900 border border-neutral-600 p-3 rounded-lg text-white focus:border-red-500 outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="text-neutral-400 text-sm font-bold mb-2 block">
                Thời lượng (phút)
              </label>
              <input
                type="number" min="60" max="200"
                name="duration"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                className="w-full bg-neutral-900 border border-neutral-600 p-3 rounded-lg text-white focus:border-red-500 outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="text-neutral-400 text-sm font-bold mb-2 block">
                Đạo diễn
              </label>
              <input
                name="director"
                value={formData.director}
                onChange={(e) =>
                  setFormData({ ...formData, director: e.target.value })
                }
                className="w-full bg-neutral-900 border border-neutral-600 p-3 rounded-lg text-white focus:border-red-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-neutral-400 text-sm font-bold mb-2 block">
                Giới hạn độ tuổi
              </label>
              <select
                name="ageRating"
                value={formData.ageRating}
                onChange={(e) =>
                  setFormData({ ...formData, ageRating: e.target.value })
                }
                className="w-full bg-neutral-900 border border-neutral-600 p-3 rounded-lg text-white focus:border-red-500 outline-none transition-colors"
              >
                <option value="P">P - Mọi lứa tuổi</option>
                <option value="K">K - Dưới 13 tuổi xem cùng phụ huynh</option>
                <option value="T13">T13 - Khán giả từ 13 tuổi trở lên</option>
                <option value="T16">T16 - Khán giả từ 16 tuổi trở lên</option>
                <option value="T18">T18 - Khán giả từ 18 tuổi trở lên</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-neutral-400 text-sm font-bold mb-2 block">
              Mô tả phim
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full bg-neutral-900 border border-neutral-600 p-3 rounded-lg text-white h-32 focus:border-red-500 outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-neutral-400 text-sm font-bold mb-2 block">
                Thể loại
              </label>
              <CreatableSelect
                isMulti
                options={genreOptions}
                value={selectedGenres}
                onChange={(opt) => {
                  setSelectedGenres(opt);
                  setFormData({
                    ...formData,
                    genreIds: opt ? opt.map((o) => o.value) : [],
                  });
                }}
                styles={customStyles}
                placeholder="Chọn thể loại..."
                isDisabled={loading}
              />
            </div>
            <div>
              <label className="text-neutral-400 text-sm font-bold mb-2 block">
                Diễn viên
              </label>
              <CreatableSelect
                isMulti
                options={actorOptions}
                value={selectedActors}
                onChange={(opt) => {
                  setSelectedActors(opt);
                  setFormData({
                    ...formData,
                    actorIds: opt ? opt.map((o) => o.value) : [],
                  });
                }}
                styles={customStyles}
                placeholder="Chọn diễn viên..."
                isDisabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="text-neutral-400 text-sm font-bold mb-2 block">
              Link Trailer
            </label>
            <input
              name="trailerUrl"
              value={formData.trailerUrl}
              onChange={(e) =>
                setFormData({ ...formData, trailerUrl: e.target.value })
              }
              className="w-full bg-neutral-900 border border-neutral-600 p-3 rounded-lg text-white focus:border-red-500 outline-none transition-colors"
              placeholder="https://youtube.com/..."
            />
          </div>
        </div>

        <div className="md:col-span-4 space-y-6">
          <div>
            <label className="text-neutral-400 text-sm font-bold mb-2 block">
              Trạng thái
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full bg-neutral-900 border border-neutral-600 p-3 rounded-lg text-white focus:border-red-500 outline-none transition-colors"
            >
              <option value="upcoming">Sắp Chiếu</option>
              <option value="active">Đang Chiếu</option>
              <option value="finished">Ngừng Chiếu</option>
            </select>
          </div>

          <div>
            <label className="text-neutral-400 text-sm font-bold mb-2 block">
              Poster Phim
            </label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setPosterMode("URL")}
                className={`flex-1 flex justify-center items-center gap-1 py-1.5 rounded text-xs font-bold ${
                  posterMode === "URL"
                    ? "bg-red-600 text-white"
                    : "bg-neutral-700 text-neutral-400"
                }`}
              >
                <LinkIcon size={12} /> Link
              </button>
              <button
                type="button"
                onClick={() => setPosterMode("FILE")}
                className={`flex-1 flex justify-center items-center gap-1 py-1.5 rounded text-xs font-bold ${
                  posterMode === "FILE"
                    ? "bg-red-600 text-white"
                    : "bg-neutral-700 text-neutral-400"
                }`}
              >
                <Upload size={12} /> Upload
              </button>
            </div>

            {posterMode === "URL" ? (
              <input
                name="posterUrl"
                value={formData.posterUrl}
                onChange={(e) =>
                  setFormData({ ...formData, posterUrl: e.target.value })
                }
                className="w-full bg-neutral-900 border border-neutral-600 p-3 rounded-lg text-white focus:border-red-500 outline-none text-sm"
                placeholder="https://..."
              />
            ) : (
              <div className="border border-dashed border-neutral-600 rounded-lg p-6 text-center hover:bg-neutral-700/30 transition-colors relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={loading}
                />
                <Upload size={24} className="mx-auto text-neutral-500 mb-2" />
                <span className="text-xs text-neutral-400">
                  Click để tải ảnh lên
                </span>
              </div>
            )}

            <div className="mt-4 aspect-2/3 w-full bg-neutral-900 rounded-lg border border-neutral-700 overflow-hidden relative">
              {formData.posterUrl ? (
                <img
                  src={formData.posterUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-neutral-600 text-xs">
                  No Preview
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-12 pt-6 border-t border-neutral-700 flex justify-end gap-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 bg-neutral-700 text-white rounded-lg font-bold hover:bg-neutral-600 transition-colors"
          >
            Hủy Bỏ
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20 flex items-center gap-2"
          >
            <Save size={18} /> {loading ? "Đang xử lý..." : "Lưu Thông Tin"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MovieForm;
