import axiosClient from "../api/axiosClient";

export const bookingService = {
  getSeatsByShowtime: (showtimeId) => {
    return axiosClient.get(`/bookings/seats?showtimeId=${showtimeId}`);
  },
  createBooking: (data) => {
    return axiosClient.post("/bookings", data);
  },
  getBookingById: (id) => {
    return axiosClient.get(`/bookings/${id}`);
  },
  cancelBooking: (id) => {
    return axiosClient.post(`/bookings/cancel/${id}`);
  },
  payBooking: (id) => {
    return axiosClient.post(`/bookings/${id}/pay`);
  },
  createVnpayPayment: (id, data) => {
    return axiosClient.post(`/bookings/payment/vnpay/${id}`, data);
  },
  vnpayCallback: (queryString) => {
    return axiosClient.get(`/bookings/payment/vnpay-callback?${queryString}`);
  },
  getMyBookings: (userId) => {
    return axiosClient.get(`/bookings/my-bookings?userId=${userId}`);
  },
  addSnacks: (bookingId, snacks) => {
    return axiosClient.post(`/bookings/${bookingId}/snacks`, { snacks });
  },
};
