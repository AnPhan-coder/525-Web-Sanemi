import axiosClient from "../api/axiosClient";

export const snackService = {
  // User: lấy menu đang bán
  getMenu: () => axiosClient.get("/snacks"),

  // Admin: toàn bộ menu
  getAdminMenu: () => axiosClient.get("/admin/snacks"),

  createItem: (data) => axiosClient.post("/admin/snacks", data),

  updateItem: (id, data) => axiosClient.put(`/admin/snacks/${id}`, data),

  toggleAvailability: (id) => axiosClient.patch(`/admin/snacks/${id}/toggle`),

  deleteItem: (id) => axiosClient.delete(`/admin/snacks/${id}`),
};
