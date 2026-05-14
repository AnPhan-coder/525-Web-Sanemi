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
  Legend,
} from "recharts";
import { DollarSign, Ticket, Users, TrendingUp } from "lucide-react";
import { format } from "date-fns";

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getAdminStats()
      .then((res) => {
        setStats(res.data.result);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const formatCurrency = (val) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);

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

  const revenueData = [...(stats.revenueByDate || [])]
    .reverse()
    .map((item) => ({
      date: format(new Date(item.date), "dd/MM"),
      revenue: item.revenue,
    }));

  const movieData = (stats.topMovies || []).map((item) => ({
    name:
      item.movie.length > 20 ? item.movie.substring(0, 20) + "..." : item.movie,
    fullTitle: item.movie,
    revenue: item.revenue,
  }));

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-yellow-500/20 rounded-lg text-yellow-500">
          <TrendingUp size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white uppercase">
            Tổng Quan Doanh Thu
          </h2>
          <p className="text-neutral-400 text-sm">
            Cập nhật theo thời gian thực
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={DollarSign}
          title="Tổng Doanh Thu"
          value={formatCurrency(stats.totalRevenue)}
          color="yellow"
        />
        <StatCard
          icon={Ticket}
          title="Vé Đã Bán"
          value={stats.totalTickets}
          color="blue"
        />
        <StatCard
          icon={Users}
          title="Thành Viên"
          value={stats.totalUsers}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6 border-l-4 border-yellow-500 pl-3">
            Xu hướng doanh thu (7 ngày)
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EAB308" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#EAB308" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#404040"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  tick={{ fontSize: 12 }}
                />
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
          </div>
        </div>

        <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6 border-l-4 border-blue-500 pl-3">
            Top 5 Phim Bán Chạy Nhất
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={movieData}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#404040"
                  horizontal={false}
                />
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
                <Bar
                  dataKey="revenue"
                  fill="#3B82F6"
                  radius={[0, 4, 4, 0]}
                  barSize={25}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value, color }) => {
  const colors = {
    yellow: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
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
      </div>
    </div>
  );
};

export default AdminStats;
