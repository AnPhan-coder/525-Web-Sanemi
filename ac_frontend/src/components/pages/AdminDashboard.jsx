import React, { useState } from "react";
import ManageShowtimes from "./ManageShowtimes";
import ManageMovie from "./ManageMovie";
import ManageRooms from "./ManageRooms";
import ManageUsers from "./ManageUsers";
import AdminStats from "./AdminStats";
import ManageSnacks from "./ManageSnacks";
import ManageTrailer from "./ManageTrailer";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("movies");

  const renderContent = () => {
    switch (activeTab) {
      case "movies": return <ManageMovie />;
      case "showtimes": return <ManageShowtimes />;
      case "rooms": return <ManageRooms />;
      case "users": return <ManageUsers />;
      case "stats": return <AdminStats />;
      case "snacks": return <ManageSnacks />;
      case "trailer": return <ManageTrailer />;
      default: return <ManageMovie />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-200 flex flex-col pt-20">
      <div className="flex flex-1 w-full max-w-[1920px] mx-auto">
        <aside className="w-64 lg:w-72 bg-neutral-800 border-r border-neutral-700 shrink-0 hidden md:block min-h-[calc(100vh-80px)]">
          <div className="p-6 fixed w-64 lg:w-72 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
            <h2 className="text-xl font-display font-bold text-red-500 mb-8 uppercase tracking-widest flex items-center gap-2">
              Quản Trị Viên
            </h2>

            <nav className="space-y-2">
              <SidebarItem
                label="Quản lý Phim"
                active={activeTab === "movies"}
                onClick={() => setActiveTab("movies")}
              />
              <SidebarItem
                label="Quản lý Lịch chiếu"
                active={activeTab === "showtimes"}
                onClick={() => setActiveTab("showtimes")}
              />
              <SidebarItem
                label="Quản lý Phòng Chiếu"
                active={activeTab === "rooms"}
                onClick={() => setActiveTab("rooms")}
              />
              <SidebarItem
                label="Quản lý Người dùng"
                active={activeTab === "users"}
                onClick={() => setActiveTab("users")}
              />
              <div className="my-4 border-t border-neutral-700"></div>
              <SidebarItem
                label="Thống kê Doanh thu"
                active={activeTab === "stats"}
                onClick={() => setActiveTab("stats")}
              />
              <div className="my-4 border-t border-neutral-700"></div>
              <SidebarItem
                label="Bắp & Nước"
                active={activeTab === "snacks"}
                onClick={() => setActiveTab("snacks")}
              />
              <SidebarItem
                label="Trailer Phim"
                active={activeTab === "trailer"}
                onClick={() => setActiveTab("trailer")}
              />
            </nav>

            <div className="mt-auto pt-8 text-xs text-neutral-500 font-body">
              Sanemi Admin System <br/> v1.0.2
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8 bg-neutral-900 overflow-x-hidden">
          <div className="md:hidden mb-6">
            <label className="text-xs text-neutral-400 uppercase font-bold mb-2 block">Chọn danh mục</label>
            <select
              className="w-full bg-neutral-800 p-3 rounded-lg text-white border border-neutral-700 focus:border-yellow-500 outline-none"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
            >
              <option value="movies">Quản lý Phim</option>
              <option value="showtimes">Quản lý Lịch chiếu</option>
              <option value="rooms">Quản lý Phòng</option>
              <option value="users">Quản lý Người dùng</option>
              <option value="stats">Thống kê Doanh thu</option>
              <option value="snacks">Bắp &amp; Nước</option>
              <option value="trailer">Trailer Phim</option>
            </select>
          </div>

          <div className="max-w-7xl mx-auto fade-in">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm lg:text-base ${
      active
        ? "bg-red-400 text-neutral-900 font-bold shadow-lg shadow-yellow-500/20"
        : "text-neutral-400 hover:bg-neutral-700 hover:text-white"
    }`}
  >
    {label}
  </button>
);

export default AdminDashboard;