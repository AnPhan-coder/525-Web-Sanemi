import React, { useEffect, useState } from "react";
import { userService } from "../../../services/userService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import {
  DollarSign,
  Ticket,
  Users,
  TrendingUp,
  Calendar,
  Film,
  Coffee,
  Grid,
} from "lucide-react";
import { format } from "date-fns";

const AdminStats = () => {
  const getTodayISO = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getPastDateISO = (daysAgo) => {
    const past = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const year = past.getFullYear();
    const month = String(past.getMonth() + 1).padStart(2, "0");
    const day = String(past.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("month");
  const [startDate, setStartDate] = useState(getPastDateISO(7)); // Mặc định 7 ngày trước
  const [endDate, setEndDate] = useState(getTodayISO());        // Mặc định hôm nay
  const [activeTab, setActiveTab] = useState("revenue");

  const formatDateToDDMMYYYY = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const loadData = () => {
    setLoading(true);
    const params = { filterType };
    if (filterType === "custom" && startDate && endDate) {
      params.startDate = formatDateToDDMMYYYY(startDate);
      params.endDate = formatDateToDDMMYYYY(endDate);
    }
    userService.getAdminStats(params)
      .then((res) => {
        setStats(res.data.result);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [filterType]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

  const formatDateString = (dateStr) => {
    if (!dateStr) return "";
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[3]}/${match[2]}`;
    }
    try {
      return format(new Date(dateStr), "dd/MM");
    } catch (e) {
      return dateStr;
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );

  if (!stats)
    return (
      <div className="text-white text-center mt-10">
        Chưa có dữ liệu thống kê
      </div>
    );

  // Prepare chart data
  const revenueData = [...(stats.revenueByDate || [])].map((item) => ({
    date: formatDateString(item.date),
    revenue: item.revenue,
  }));

  const movieData = (stats.topMovies || []).map((item) => ({
    name:
      item.movie.length > 20 ? item.movie.substring(0, 20) + "..." : item.movie,
    fullTitle: item.movie,
    revenue: item.revenue,
  }));

  const viewerData = (stats.topMoviesByViewers || []).map((item) => ({
    name:
      item.movie.length > 20 ? item.movie.substring(0, 20) + "..." : item.movie,
    fullTitle: item.movie,
    viewers: item.viewers,
  }));

  const filterLabels = {
    day: "Hôm nay",
    week: "7 ngày qua",
    month: "30 ngày qua",
    all: "Tất cả thời gian",
    custom: `Từ ${formatDateToDDMMYYYY(startDate)} đến ${formatDateToDDMMYYYY(endDate)}`,
  };

  const getActiveFilterLabel = () => {
    return filterLabels[filterType] || "Đang lọc";
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-700 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-500/20 rounded-lg text-yellow-500">
            <TrendingUp size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-wide">
              Thống Kê Doanh Nghiệp
            </h2>
            <p className="text-neutral-400 text-sm">
              Xem báo cáo chi tiết về tình hình kinh doanh
            </p>
          </div>
        </div>


      </div>
      {/* Date Filter Selection */}
      <div className="flex flex-wrap items-center gap-2">
        {["day", "week", "month", "all", "custom"].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 border ${filterType === type
              ? "bg-yellow-500 text-black border-yellow-500 font-bold"
              : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700 hover:text-white"
              }`}
          >
            {type === "day" && "Hôm nay"}
            {type === "week" && "Tuần"}
            {type === "month" && "Tháng"}
            {type === "all" && "Tất cả"}
            {type === "custom" && "Tùy chọn"}
          </button>
        ))}
      </div>
      {filterType === "custom" && (
        <div className="flex flex-wrap items-center gap-4 bg-neutral-800/50 p-4 rounded-xl border border-neutral-700/80 animate-slideDown">
          <div className="flex items-center gap-2 text-neutral-300 text-sm">
            <Calendar size={16} className="text-yellow-500" />
            <span>Chọn khoảng thời gian:</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 text-white text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-yellow-500"
            />
            <span className="text-neutral-400 text-sm">đến</span>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 text-white text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-yellow-500"
            />
            <button
              onClick={loadData}
              className="bg-yellow-500 hover:bg-yellow-600 active:scale-95 text-black font-bold text-xs px-4 py-1.5 rounded-lg transition-all duration-150 uppercase tracking-wider shadow-lg shadow-yellow-500/20"
            >
              Lọc
            </button>
          </div>
        </div>
      )}

      {/* Tabs bar */}
      <div className="flex border-b border-neutral-700">
        {[
          { id: "revenue", label: "Doanh Thu & Vé", icon: DollarSign },
          { id: "viewers", label: "Lượt Xem", icon: Film },
          { id: "snacks", label: "Bắp Nước", icon: Coffee },
          { id: "seats", label: "Ghế Đặt Nhiều", icon: Grid },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border-b-2 transition-all duration-150 ${activeTab === tab.id
                ? "border-yellow-500 text-yellow-500 bg-yellow-500/5"
                : "border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/30"
                }`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Tab content */}
      <div className="pt-2">
        {activeTab === "revenue" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Overview Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                icon={DollarSign}
                title={`Doanh thu `}
                value={formatCurrency(stats.totalRevenue)}
                color="yellow"
              />
              <StatCard
                icon={Ticket}
                title={`Vé Đã Bán `}
                value={stats.totalTickets}
                color="blue"
              />
              <StatCard
                icon={Users}
                title="Thành Viên"
                value={`${stats.newUsers} Mới`}
                subValue={`Tổng số: ${stats.totalUsers}`}
                color="purple"
              />
            </div>

            {/* Charts and Tables section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Column 1: Revenue Trend Chart & Table */}
              <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-lg flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-6 border-l-4 border-yellow-500 pl-3">
                    Xu hướng doanh thu
                  </h3>
                  <div className="h-[300px]">
                    {revenueData.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
                        Không có dữ liệu trong khoảng thời gian này
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#EAB308" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#EAB308" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#404040" vertical={false} />
                          <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                          <YAxis
                            stroke="#9ca3af"
                            tickFormatter={(val) => `${val / 1000}k`}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#171717",
                              borderColor: "#404040",
                              color: "#fff",
                            }}
                            formatter={(val) => formatCurrency(val)}
                          />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#EAB308"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="mt-8 border-t border-neutral-700/60 pt-6">
                  <h4 className="text-sm font-semibold text-neutral-300 mb-3 uppercase tracking-wider">
                    Bảng số liệu chi tiết theo ngày
                  </h4>
                  {revenueData.length === 0 ? (
                    <div className="text-neutral-500 text-sm py-4 text-center">
                      Không có dữ liệu
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-64 overflow-y-auto custom-scrollbar border border-neutral-700/50 rounded-lg">
                      <table className="w-full text-left text-neutral-300 text-xs">
                        <thead className="text-neutral-400 uppercase bg-neutral-900 border-b border-neutral-700 sticky top-0">
                          <tr>
                            <th scope="col" className="px-4 py-2.5">Ngày</th>
                            <th scope="col" className="px-4 py-2.5 text-right">Doanh thu</th>
                          </tr>
                        </thead>
                        <tbody>
                          {revenueData.map((item, index) => (
                            <tr
                              key={index}
                              className="border-b border-neutral-800 hover:bg-neutral-700/30 transition-colors"
                            >
                              <td className="px-4 py-2.5 font-medium text-white">{item.date}</td>
                              <td className="px-4 py-2.5 text-right font-bold text-yellow-500">
                                {formatCurrency(item.revenue)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Column 2: Top Movies Chart & Table */}
              <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-lg flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-6 border-l-4 border-blue-500 pl-3">
                    Top 5 Phim Bán Chạy Nhất
                  </h3>
                  <div className="h-[300px]">
                    {movieData.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
                        Không có dữ liệu trong khoảng thời gian này
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={movieData} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#404040" horizontal={false} />
                          <XAxis type="number" stroke="#9ca3af" hide />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={120}
                            stroke="#fff"
                            style={{ fontSize: "13px", fontWeight: "500" }}
                          />
                          <Tooltip
                            cursor={{ fill: "#ffffff10" }}
                            contentStyle={{
                              backgroundColor: "#171717",
                              borderColor: "#404040",
                              color: "#fff",
                            }}
                            formatter={(val) => formatCurrency(val)}
                            labelFormatter={(label, payload) =>
                              payload[0]?.payload?.fullTitle || label
                            }
                          />
                          <Bar dataKey="revenue" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={25} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="mt-8 border-t border-neutral-700/60 pt-6">
                  <h4 className="text-sm font-semibold text-neutral-300 mb-3 uppercase tracking-wider">
                    Bảng xếp hạng doanh thu phim
                  </h4>
                  {movieData.length === 0 ? (
                    <div className="text-neutral-500 text-sm py-4 text-center">
                      Không có dữ liệu
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-neutral-700/50 rounded-lg">
                      <table className="w-full text-left text-neutral-300 text-xs">
                        <thead className="text-neutral-400 uppercase bg-neutral-900 border-b border-neutral-700">
                          <tr>
                            <th scope="col" className="px-4 py-2.5 w-16">Hạng</th>
                            <th scope="col" className="px-4 py-2.5">Tên phim</th>
                            <th scope="col" className="px-4 py-2.5 text-right">Doanh thu</th>
                          </tr>
                        </thead>
                        <tbody>
                          {movieData.map((item, index) => (
                            <tr
                              key={index}
                              className="border-b border-neutral-800 hover:bg-neutral-700/30 transition-colors"
                            >
                              <td className="px-4 py-2.5 text-neutral-400 font-bold text-center">
                                {index + 1}
                              </td>
                              <td
                                className="px-4 py-2.5 font-medium text-white truncate max-w-[200px]"
                                title={item.fullTitle}
                              >
                                {item.fullTitle}
                              </td>
                              <td className="px-4 py-2.5 text-right font-bold text-emerald-400">
                                {formatCurrency(item.revenue)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "viewers" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Overview Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard
                icon={Film}
                title={`Tổng lượt xem phim bán chạy`}
                value={`${viewerData.reduce((sum, item) => sum + (item.viewers || 0), 0)} lượt`}
                color="purple"
              />
              <StatCard
                icon={TrendingUp}
                title="Phim xem nhiều nhất"
                value={viewerData[0]?.name || "Chưa có dữ liệu"}
                subValue={viewerData[0] ? `${viewerData[0].viewers} lượt xem` : ""}
                color="yellow"
              />
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart */}
              <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-lg flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-6 border-l-4 border-purple-500 pl-3">
                    Top 5 Phim Có Nhiều Người Xem Nhất
                  </h3>
                  <div className="h-[300px]">
                    {viewerData.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
                        Không có dữ liệu trong khoảng thời gian này
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={viewerData} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#404040" horizontal={false} />
                          <XAxis type="number" stroke="#9ca3af" hide />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={120}
                            stroke="#fff"
                            style={{ fontSize: "13px", fontWeight: "500" }}
                          />
                          <Tooltip
                            cursor={{ fill: "#ffffff10" }}
                            contentStyle={{
                              backgroundColor: "#171717",
                              borderColor: "#404040",
                              color: "#fff",
                            }}
                            formatter={(val) => [`${val} lượt xem`, "Lượt xem"]}
                            labelFormatter={(label, payload) =>
                              payload[0]?.payload?.fullTitle || label
                            }
                          />
                          <Bar dataKey="viewers" fill="#A855F7" radius={[0, 4, 4, 0]} barSize={25} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-lg flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-6 border-l-4 border-yellow-500 pl-3">
                    Chi tiết lượt xem phim
                  </h3>
                  {viewerData.length === 0 ? (
                    <div className="text-neutral-500 text-sm py-8 text-center">
                      Không có dữ liệu
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-neutral-700/50 rounded-lg">
                      <table className="w-full text-left text-neutral-300 text-xs">
                        <thead className="text-neutral-400 uppercase bg-neutral-900 border-b border-neutral-700">
                          <tr>
                            <th scope="col" className="px-4 py-2.5 w-16">Hạng</th>
                            <th scope="col" className="px-4 py-2.5">Tên phim</th>
                            <th scope="col" className="px-4 py-2.5 text-right">Lượt xem</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewerData.map((item, index) => (
                            <tr
                              key={index}
                              className="border-b border-neutral-800 hover:bg-neutral-700/30 transition-colors"
                            >
                              <td className="px-4 py-2.5 text-neutral-400 font-bold text-center">
                                {index + 1}
                              </td>
                              <td
                                className="px-4 py-2.5 font-medium text-white truncate max-w-[200px]"
                                title={item.fullTitle}
                              >
                                {item.fullTitle}
                              </td>
                              <td className="px-4 py-2.5 text-right font-bold text-purple-400">
                                {item.viewers} lượt
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "snacks" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Overview Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard
                icon={Coffee}
                title={`Tổng sản phẩm bắp nước`}
                value={`${(stats.snacksStats || []).reduce((sum, item) => sum + (item.quantity || 0), 0)} phần`}
                color="blue"
              />
              <StatCard
                icon={DollarSign}
                title={`Doanh thu bắp nước`}
                value={formatCurrency((stats.snacksStats || []).reduce((sum, item) => sum + (item.revenue || 0), 0))}
                color="emerald"
              />
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Table detail list */}
              <div className="lg:col-span-3 bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4 border-l-4 border-yellow-500 pl-3">
                  Chi Tiết Bán Bắp Nước
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-neutral-300">
                    <thead className="text-xs text-neutral-400 uppercase bg-neutral-900 border-b border-neutral-700">
                      <tr>
                        <th scope="col" className="px-4 py-3">Tên sản phẩm</th>
                        <th scope="col" className="px-4 py-3 text-center">Số lượng bán</th>
                        <th scope="col" className="px-4 py-3 text-right">Tổng doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(!stats.snacksStats || stats.snacksStats.length === 0) ? (
                        <tr>
                          <td colSpan="3" className="px-4 py-8 text-center text-neutral-500">
                            Chưa có dữ liệu doanh thu bắp nước
                          </td>
                        </tr>
                      ) : (
                        stats.snacksStats.map((item, index) => (
                          <tr
                            key={index}
                            className="border-b border-neutral-800 hover:bg-neutral-700/30 transition-colors"
                          >
                            <td className="px-4 py-3.5 font-medium text-white">{item.name}</td>
                            <td className="px-4 py-3.5 text-center font-bold text-yellow-500">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3.5 text-right font-bold text-emerald-400">
                              {formatCurrency(item.revenue)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Snack visual bar chart */}
              <div className="lg:col-span-2 bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-6 border-l-4 border-emerald-500 pl-3">
                  Biểu đồ Số Lượng Bán
                </h3>
                <div className="h-[300px]">
                  {(!stats.snacksStats || stats.snacksStats.length === 0) ? (
                    <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
                      Không có dữ liệu
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats.snacksStats.map((item) => ({
                          name: item.name.length > 12 ? item.name.substring(0, 12) + "..." : item.name,
                          full: item.name,
                          quantity: item.quantity,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#404040" vertical={false} />
                        <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#171717",
                            borderColor: "#404040",
                            color: "#fff",
                          }}
                          formatter={(val) => [`${val} phần`, "Số lượng"]}
                          labelFormatter={(label, payload) => payload[0]?.payload?.full || label}
                        />
                        <Bar dataKey="quantity" fill="#10B981" radius={[4, 4, 0, 0]} barSize={25} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "seats" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Overview Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard
                icon={Grid}
                title="Ghế được đặt nhiều nhất"
                value={stats.topSeats && stats.topSeats[0] ? `Ghế ${stats.topSeats[0].seatCode}` : "Chưa có dữ liệu"}
                subValue={stats.topSeats && stats.topSeats[0] ? `${stats.topSeats[0].count} lượt đặt` : ""}
                color="yellow"
              />
              <StatCard
                icon={Ticket}
                title={`Tổng lượt đặt ghế`}
                value={`${(stats.topSeats || []).reduce((sum, item) => sum + (item.count || 0), 0)} lượt`}
                color="blue"
              />
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Column 1: Chart */}
              <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-6 border-l-4 border-yellow-500 pl-3">
                  Biểu đồ số lượt đặt ghế
                </h3>
                <div className="h-[300px]">
                  {(!stats.topSeats || stats.topSeats.length === 0) ? (
                    <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
                      Không có dữ liệu
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={(stats.topSeats || []).map((item) => ({
                          name: `Ghế ${item.seatCode}`,
                          count: item.count,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#404040" vertical={false} />
                        <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#171717",
                            borderColor: "#404040",
                            color: "#fff",
                          }}
                          formatter={(val) => [`${val} lượt đặt`, "Số lượt"]}
                        />
                        <Bar dataKey="count" fill="#EAB308" radius={[4, 4, 0, 0]} barSize={25} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Column 2: Leaderboard detail table */}
              <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-6 border-l-4 border-blue-500 pl-3">
                  Bảng xếp hạng vị trí ghế đặt nhiều
                </h3>
                {(!stats.topSeats || stats.topSeats.length === 0) ? (
                  <div className="text-neutral-500 text-sm py-8 text-center">
                    Không có dữ liệu
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-neutral-700/50 rounded-lg">
                    <table className="w-full text-left text-neutral-300 text-xs">
                      <thead className="text-neutral-400 uppercase bg-neutral-900 border-b border-neutral-700">
                        <tr>
                          <th scope="col" className="px-4 py-2.5 w-16">Thứ hạng</th>
                          <th scope="col" className="px-4 py-2.5">Mã ghế</th>
                          <th scope="col" className="px-4 py-2.5 text-right">Số lượt đặt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.topSeats.map((item, index) => (
                          <tr
                            key={index}
                            className="border-b border-neutral-800 hover:bg-neutral-700/30 transition-colors"
                          >
                            <td className="px-4 py-2.5 text-neutral-400 font-bold text-center">
                              {index + 1}
                            </td>
                            <td className="px-4 py-2.5 font-medium text-white">
                              Ghế {item.seatCode}
                            </td>
                            <td className="px-4 py-2.5 text-right font-bold text-yellow-500">
                              {item.count} lượt
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value, subValue, color }) => {
  const colors = {
    yellow: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  };

  return (
    <div
      className={`p-6 rounded-xl border shadow-lg flex items-center gap-4 transition-transform hover:-translate-y-1 bg-neutral-800 border-neutral-700 overflow-hidden`}
    >
      <div className={`p-4 rounded-full shrink-0 ${colors[color]}`}>
        <Icon size={32} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1 truncate">
          {title}
        </p>
        <h3
          className="text-2xl md:text-3xl font-bold text-white truncate"
          title={value}
        >
          {value}
        </h3>
        {subValue && (
          <p className="text-neutral-500 text-xs mt-1 font-medium italic">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminStats;
