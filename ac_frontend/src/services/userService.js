import axiosClient from "../api/axiosClient";

export const userService = {
  getUserById: (id) => {
    return axiosClient.get(`/users/${id}`);
  },
  updateProfile: (id, data) => {
    return axiosClient.put(`/users/${id}`, data);
  },
  getUsers: () => {
    return axiosClient.get("/admin/users");
  },
  updateUserStatus: (id, status) => {
    // Assuming the current logic is to hit this endpoint with no payload or empty payload
    // You might need to adjust this depending on the exact backend requirement
    return axiosClient.put(`/admin/users/${id}/status`, null, { params: { status } });
  },
  updateUserRole: (id, role) => {
    return axiosClient.put(`/admin/users/${id}/role`, null, { params: { role } });
  },
  getUserBookings: (id) => {
    return axiosClient.get(`/admin/users/${id}/bookings`);
  },
  getAdminStats: () => {
    return axiosClient.get("/admin/stats");
  }
};
