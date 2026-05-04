import React, { useEffect, useState, useMemo } from "react";
import axiosClient from "../../api/axiosClient";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { useApiCall } from "../../hooks/useApiCall";
import { LoadingSkeleton } from "./LoadingSpinner";
import {
  Users,
  Search,
  Mail,
  Shield,
  Clock,
  Lock,
  Unlock,
  History,
  MapPin,
  Calendar,
  ShieldAlert,
} from "lucide-react";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [selectedUserHistory, setSelectedUserHistory] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const { loading, execute } = useApiCall();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await execute(() => axiosClient.get("/admin/users"), {
      onSuccess: (res) => setUsers(res.data.result || []),
      errorMessage: "Lỗi tải danh sách người dùng",
    });
  };

  const filteredUsers = useMemo(() => {
    if (!debouncedSearchTerm) return users;
    const lower = debouncedSearchTerm.toLowerCase();
    return users.filter(
      (u) =>
        (u.name?.toLowerCase() || "").includes(lower) ||
        (u.email?.toLowerCase() || "").includes(lower)
    );
  }, [users, debouncedSearchTerm]);

  const handleToggleStatus = (id, currentStatus, name) => {
    const actionText = currentStatus ? "Khóa" : "Mở khóa";
    Swal.fire({
      title: `${actionText} tài khoản?`,
      text: `Người dùng: ${name}`,
      icon: "warning",
      background: "#171717",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: currentStatus ? "#dc2626" : "#16a34a",
      cancelButtonColor: "#404040",
      confirmButtonText: `Đồng ý ${actionText}`,
    }).then(async (res) => {
      if (res.isConfirmed) {
        await execute(() => axiosClient.put(`/admin/users/${id}/status`), {
          successMessage: `Đã ${actionText} thành công!`,
          onSuccess: () => loadData(),
        });
      }
    });
  };

  const handleChangeRole = (user) => {
    const isCurrentlyAdmin = user.role === "admin";
    const newRole = isCurrentlyAdmin ? "customer" : "admin";

    Swal.fire({
      title: `Thay đổi quyền?`,
      text: `Chuyển ${user.name} thành ${
        isCurrentlyAdmin ? "Khách hàng" : "Admin"
      }?`,
      icon: "question",
      background: "#171717",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#ca8a04",
      confirmButtonText: "Xác nhận",
    }).then(async (res) => {
      if (res.isConfirmed) {
        await execute(
          () =>
            axiosClient.put(`/admin/users/${user.id}/role`, null, {
              params: { role: newRole },
            }),
          {
            successMessage: "Cập nhật quyền thành công!",
            onSuccess: () => loadData(),
          }
        );
      }
    });
  };

  const handleViewHistory = async (user) => {
    setSelectedUserHistory(user);
    setLoadingHistory(true);
    setHistoryList([]);
    try {
      const res = await axiosClient.get(`/admin/users/${user.id}/bookings`);
      const data = res.data.result || [];
      const sortedData = data.sort((a, b) => new Date(b.bookingTime) - new Date(a.bookingTime));
      
      setHistoryList(sortedData);
      console.error(error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  return (
    <div className="p-4 md:p-8 text-white w-full font-body">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-neutral-800 pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tight flex items-center gap-3">
            <span className="p-2 bg-red-600/10 rounded-lg text-red-500 border border-red-600/20">
              <Users size={24} />
            </span>
            Quản Lý Người Dùng
          </h2>
          <p className="text-neutral-500 text-sm mt-1">
            Kiểm soát tài khoản và phân quyền
          </p>
        </div>

        <div className="relative group">
          <Search
            size={18}
            className="absolute left-3 top-3 text-neutral-500 group-focus-within:text-red-500 transition-colors"
          />
          <input
            type="text"
            placeholder="Tìm theo tên, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-neutral-900 border border-neutral-700 text-white text-sm rounded-lg focus:border-red-500 block w-64 pl-10 p-2.5 outline-none transition-all"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`relative bg-neutral-800/50 p-6 rounded-xl border transition-all hover:border-neutral-600 group ${
                user.isActive === false
                  ? "border-red-900/30 opacity-70 grayscale-[0.5]"
                  : "border-neutral-800"
              }`}
            >
              <div className="flex justify-between items-start mb-4 gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shrink-0 border ${
                      user.role === "admin"
                        ? "bg-red-600 text-white border-red-500"
                        : "bg-neutral-700 text-neutral-300 border-neutral-600"
                    }`}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3
                      className="font-bold text-white text-base truncate"
                      title={user.name}
                    >
                      {user.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs font-semibold tracking-wide mt-1">
                      {user.role === "admin" ? (
                        <span className="text-red-500 flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded">
                          <Shield size={10} /> Admin
                        </span>
                      ) : (
                        <span className="text-neutral-500 bg-neutral-700/50 px-2 py-0.5 rounded">
                          Khách hàng
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-neutral-400 mb-6 pt-2 border-t border-neutral-700/50">
                <div className="flex items-center gap-3">
                  <Mail size={14} className="min-w-3.5" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={14} className="min-w-3.5" />
                  <span>
                    Đăng ký:{" "}
                    {user.createdAt
                      ? format(new Date(user.createdAt), "dd/MM/yyyy")
                      : "N/A"}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div
                  className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${
                    user.isActive !== false
                      ? "text-green-500 bg-green-500/10"
                      : "text-red-500 bg-red-500/10"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      user.isActive !== false ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  {user.isActive !== false ? "Hoạt động" : "Đã khóa"}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewHistory(user)}
                    className="p-2 bg-neutral-700 hover:bg-white hover:text-black rounded-lg transition-colors"
                    title="Lịch sử"
                  >
                    <History size={16} />
                  </button>
                  <button
                    onClick={() => handleChangeRole(user)}
                    className="p-2 bg-neutral-700 hover:bg-yellow-600 hover:text-white rounded-lg transition-colors"
                    title="Đổi quyền"
                  >
                    <ShieldAlert size={16} />
                  </button>
                  {user.role !== "admin" && (
                    <button
                      onClick={() =>
                        handleToggleStatus(
                          user.id,
                          user.isActive !== false,
                          user.name
                        )
                      }
                      className={`p-2 rounded-lg transition-colors text-white ${
                        user.isActive !== false
                          ? "bg-neutral-700 hover:bg-red-600"
                          : "bg-red-900/50 hover:bg-green-600"
                      }`}
                    >
                      {user.isActive !== false ? (
                        <Lock size={16} />
                      ) : (
                        <Unlock size={16} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedUserHistory && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-neutral-900 w-full max-w-4xl rounded-2xl border border-neutral-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-neutral-800 flex justify-between items-center bg-neutral-900">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <History size={20} className="text-red-500" /> Lịch sử giao
                dịch:{" "}
                <span className="text-red-500">{selectedUserHistory.name}</span>
              </h3>
              <button
                onClick={() => setSelectedUserHistory(null)}
                className="p-2 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-neutral-900">
              {loadingHistory ? (
                <div className="text-center py-10 text-neutral-500">
                  Đang tải...
                </div>
              ) : historyList.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 border border-dashed border-neutral-800 rounded-xl bg-neutral-800/20">
                  Người dùng này chưa có giao dịch nào.
                </div>
              ) : (
                <div className="space-y-4">
                  {historyList.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-800 flex flex-col md:flex-row gap-4 items-center hover:border-neutral-600 transition-colors"
                    >
                      <img
                        src={booking.showtime?.movie?.posterUrl}
                        className="w-14 h-20 object-cover rounded shadow-sm"
                        alt=""
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-base truncate">
                          {booking.showtime?.movie?.title}
                        </h4>
                        <div className="text-sm text-neutral-400 space-y-1 mt-1">
                          <p className="flex items-center gap-2">
                            <MapPin size={12} /> {booking.showtime?.room?.name}
                          </p>
                          <p className="flex items-center gap-2">
                            <Calendar size={12} />{" "}
                            {format(
                              new Date(booking.bookingTime),
                              "dd/MM/yyyy HH:mm"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded border ${
                            booking.status === "paid"
                              ? "bg-green-900/20 border-green-800 text-green-500"
                              : "bg-red-900/20 border-red-800 text-red-500"
                          }`}
                        >
                          {booking.status === "paid"
                            ? "ĐÃ THANH TOÁN"
                            : booking.status}
                        </span>
                        <p className="font-mono font-bold text-lg text-white mt-2">
                          {formatCurrency(booking.totalPrice)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
