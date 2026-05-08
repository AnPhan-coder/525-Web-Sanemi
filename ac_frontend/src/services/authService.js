import axiosClient from "../api/axiosClient";

export const authService = {
  login: (data) => {
    return axiosClient.post("/auth/login", data);
  },
  register: (data) => {
    return axiosClient.post("/auth/register", data);
  },
  loginWithGoogle: (data) => {
    return axiosClient.post("/auth/google", data);
  },
  forgotPassword: (email) => {
    return axiosClient.post(`/auth/forgot-password?email=${email}`);
  },
  resetPassword: (data) => {
    return axiosClient.post("/auth/reset-password", data);
  }
};
