import axiosClient from "./axiosClient";

const reviewApi = {
  upsertReview: (data) => axiosClient.post('/reviews', data),
  getReviewsByMovie: (movieId) => axiosClient.get(`/reviews/movie/${movieId}`),
  getCommunityReviews: (params) => axiosClient.get('/reviews/community', { params }),
  getMyReview: (movieId) => axiosClient.get(`/reviews/my/${movieId}`),
  deleteReview: (id) => axiosClient.delete(`/reviews/${id}`),
  createReply: (data) => axiosClient.post('/reviews/reply', data),
  deleteReply: (id) => axiosClient.delete(`/reviews/reply/${id}`)
};

export default reviewApi;