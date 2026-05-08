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
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
};
