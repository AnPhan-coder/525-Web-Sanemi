import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, History, LogOut } from "lucide-react";
import MyInfo from "./MyInfo";
import MyBookings from "./MyBookings";
import { userService } from "../../../services/userService";

const UserProfileMain = () => {
  const [activeTab, setActiveTab] = useState("info");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchUserData = async (userId) => {
    try {
      const res = await userService.getUserById(userId);
      if (res.data.result) {
        const latestUser = res.data.result;
        setUser(latestUser);
        localStorage.setItem("user", JSON.stringify(latestUser));
      }
    } catch (err) {
      console.error("Lỗi lấy thông tin người dùng:", err);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchUserData(parsedUser.id);
  }, [navigate]);

  const handleUserUpdate = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
    window.dispatchEvent(new Event("user-update"));
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="pt-24 pb-10 min-h-screen bg-neutral-900 text-white px-4 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-6 shadow-lg sticky top-24">
            <div className="flex flex-col items-center mb-8 border-b border-neutral-700 pb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-tr from-red-600 to-amber-500 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-4 border-4 border-neutral-800 shadow-xl">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                {user.membershipLevel === "VIP" && (
                  <span className="absolute -bottom-1 -right-1 bg-yellow-500 text-neutral-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-neutral-800 uppercase tracking-wider animate-pulse shadow-lg">
                    VIP
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold font-display text-white text-center">
                {user.name}
              </h2>

              <div className="mt-4 w-full bg-neutral-900/50 rounded-lg p-3 border border-neutral-700/50 text-center">
                <p className="text-xs text-neutral-400 font-semibold mb-1 uppercase tracking-wide">
                  Hạng thành viên
                </p>
                <p className={`text-sm font-black uppercase tracking-wider ${user.membershipLevel === "VIP"
                    ? "text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.2)]"
                    : "text-neutral-300"
                  }`}>
                  {user.membershipLevel === "VIP" ? " VIP Member" : "Standard"}
                </p>
                <div className="mt-3 text-left">
                  <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span>Đã tích lũy:</span>
                    <span className="font-bold text-white">{(user.totalSpent || 0).toLocaleString("vi-VN")} đ</span>
                  </div>
                  {user.membershipLevel !== "VIP" && (
                    <>
                      <div className="w-full bg-neutral-700 h-1.5 rounded-full overflow-hidden mb-1">
                        <div
                          className="bg-yellow-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(((user.totalSpent || 0) / 1000000) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-neutral-500 italic text-center">
                        Tích lũy thêm {Math.max(1000000 - (user.totalSpent || 0), 0).toLocaleString("vi-VN")} đ để lên VIP
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              <SidebarBtn
                active={activeTab === "info"}
                onClick={() => setActiveTab("info")}
                icon={User}
                label="Thông Tin Cá Nhân"
              />
              <SidebarBtn
                active={activeTab === "history"}
                onClick={() => setActiveTab("history")}
                icon={History}
                label="Lịch Sử Đặt Vé"
              />

              <div className="pt-4 mt-4 border-t border-neutral-700">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-neutral-400 hover:bg-neutral-700 hover:text-red-500 transition-all group"
                >
                  <LogOut size={20} className="group-hover:text-red-500" /> Đăng
                  Xuất
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-8 shadow-lg min-h-[600px]">
            {activeTab === "info" ? (
              <MyInfo user={user} onUpdate={handleUserUpdate} />
            ) : (
              <MyBookings user={user} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SidebarBtn = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${active
        ? "bg-red-600 text-white shadow-lg shadow-red-900/20"
        : "text-neutral-400 hover:bg-neutral-700 hover:text-white"
      }`}
  >
    <Icon size={20} /> {label}
  </button>
);

export default UserProfileMain;
