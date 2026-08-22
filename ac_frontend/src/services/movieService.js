import axiosClient from "../api/axiosClient";

export const movieService = {
  getMovies: () => {
    return axiosClient.get("/movies");
  },
  getMovieById: (id) => {
    return axiosClient.get(`/movies/${id}`);
  },
  getShowtimesByMovieId: (id) => {
    return axiosClient.get(`/showtimes/movie?movieId=${id}`);
  },
  createMovie: (data) => {
    return axiosClient.post("/movies", data);
  },
  updateMovie: (id, data) => {
    return axiosClient.put(`/movies/${id}`, data);
  },
  deleteMovie: (id) => {
    return axiosClient.delete(`/movies/${id}`);
  },
  searchMovies: (params) => {
    return axiosClient.get("/movies/search", { params });
  },
  getGenres: () => {
    return axiosClient.get("/genres");
  },
  getActors: () => {
    return axiosClient.get("/actors");
  },
  uploadFile: (form) => {
    return axiosClient.post("/upload", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  uploadTrailer: (form, onProgress) => {
    return axiosClient.post("/upload/trailer", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
  },
  generateVoiceover: (id, lang = "vi") => {
    return axiosClient.post(`/movies/${id}/voiceover?lang=${lang}`);
  },
  confirmTrailer: (id, url, languageName) => {
    return axiosClient.post(`/movies/${id}/trailers/confirm?url=${encodeURIComponent(url)}&languageName=${encodeURIComponent(languageName)}`);
  },
  getMovieTrailers: (id) => {
    return axiosClient.get(`/movies/${id}/trailers`);
  },
};
