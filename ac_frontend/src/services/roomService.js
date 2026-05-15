import axiosClient from "../api/axiosClient";

export const roomService = {
  getRooms: () => {
    return axiosClient.get("/rooms");
  },
  getRoomById: (id) => {
    return axiosClient.get(`/rooms/${id}`);
  },
  createRoom: (data) => {
    return axiosClient.post("/rooms", data);
  },
  updateRoom: (id, data) => {
    return axiosClient.put(`/rooms/${id}`, data);
  },
  deleteRoom: (id) => {
    return axiosClient.delete(`/rooms/${id}`);
  }
};

export const seatService = {
  getSeatsByRoomId: (roomId) => {
    return axiosClient.get(`/seats?roomId=${roomId}`);
  },
  batchUpdateSeats: (seats) => {
    return axiosClient.post("/seats/batch-update", seats);
  }
};
