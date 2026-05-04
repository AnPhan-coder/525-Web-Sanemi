// src/pages/Profile/UserProfileMain.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, History, LogOut } from "lucide-react";
import MyInfo from "./MyInfo";
import MyBookings from "./MyBookings";

const UserProfileMain = () => {
  const [activeTab, setActiveTab] = useState("info");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
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
              <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-4 border-4 border-neutral-800 shadow-xl">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-xl font-bold font-display text-white text-center">
                {user.name}
              </h2>
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
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${
      active
        ? "bg-red-600 text-white shadow-lg shadow-red-900/20"
        : "text-neutral-400 hover:bg-neutral-700 hover:text-white"
    }`}
  >
    <Icon size={20} /> {label}
  </button>
);

export default UserProfileMain;
