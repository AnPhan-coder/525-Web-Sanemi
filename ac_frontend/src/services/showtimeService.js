import axiosClient from "../api/axiosClient";

export const showtimeService = {
  getShowtimes: () => {
    return axiosClient.get("/showtimes");
  },
  getShowtimesByMovie: (movieId) => {
    return axiosClient.get(`/showtimes/movie?movieId=${movieId}`);
  },
  getAdminShowtimes: () => {
    return axiosClient.get("/admin/showtimes");
  },
  createShowtime: (data) => {
    return axiosClient.post("/admin/showtimes", data);
  },
  deleteShowtime: (id) => {
    return axiosClient.delete(`/admin/showtimes/${id}`);
  },
  autoGenerateShowtimes: (data) => {
    return axiosClient.post("/admin/showtimes/auto-generate", data);
  }
};
