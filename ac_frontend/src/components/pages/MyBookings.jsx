import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { bookingService } from "../../services/bookingService";
import { Clock, MapPin, QrCode, CreditCard, XCircle } from "lucide-react";
import Swal from "sweetalert2";
import { formatCurrency } from "../../utils/bookingHelpers";

const MyBookings = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      try {
        const res = await bookingService.getMyBookings(user.id);
        setBookings(res.data.result || res.data || []);
      } catch (error) {
        console.error("Lỗi tải vé:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  const getFilteredBookings = () => {
    if (activeTab === "ALL") return bookings;
    return bookings.filter(b => b.status?.toLowerCase() === activeTab.toLowerCase());
  };

  // Hàm mở QR Code
  const handleShowQR = (booking) => {
    const qrData = `BOOKING_ID:${booking.id}`; 
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;

    Swal.fire({
      title: "Mã Vé Check-in",
      html: `
        <div class="flex flex-col items-center">
            <p class="mb-4 text-sm">Đưa mã này cho nhân viên soát vé</p>
            <img src="${qrUrl}" alt="QR Code" class="border-4 border-white rounded-lg shadow-lg" />
            <p class="mt-4 font-bold text-xl text-yellow-500">Mã: ${booking.id}</p>
        </div>
      `,
      background: "#171717",
      color: "#fff",
      showConfirmButton: false,
      showCloseButton: true
    });
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleString("vi-VN");

  if (loading) return <div className="text-center py-10 text-neutral-500">Đang tải dữ liệu vé...</div>;

  const filteredData = getFilteredBookings();

  return (
    <div>
      <h2 className="text-2xl font-bold font-display text-white mb-6 border-l-4 border-red-600 pl-4">
        Lịch Sử Đặt Vé
      </h2>

      {/* --- TABS --- */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-neutral-700">
        {[
            { id: "ALL", label: "Tất cả" },
            { id: "PENDING", label: "Chờ thanh toán" }, 
            { id: "PAID", label: "Đã thanh toán" },
            { id: "CANCELLED", label: "Đã hủy" }
        ].map((tab) => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                    activeTab === tab.id 
                    ? "bg-red-600 text-white" 
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                }`}
            >
                {tab.label}
            </button>
        ))}
      </div>

      {/* --- LIST --- */}
      <div className="space-y-4">
        {filteredData.length === 0 ? (
            <div className="text-center py-12 bg-neutral-900/50 rounded-xl border border-dashed border-neutral-700">
                <p className="text-neutral-500">Không tìm thấy vé nào trong mục này.</p>
            </div>
        ) : (
            filteredData.map((booking) => {
                const status = booking.status?.toLowerCase();
                return (
                    <div key={booking.id} className="bg-neutral-900 p-5 rounded-xl border border-neutral-700 hover:border-red-600 transition-all group">
                        <div className="flex flex-col md:flex-row gap-4 justify-between">
                            
                            {/* Thông tin vé */}
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-white group-hover:text-red-500 transition-colors uppercase">
                                    {booking.showtime?.movie?.title}
                                </h3>
                                <div className="text-sm text-neutral-400 mt-2 space-y-1">
                                    <p className="flex items-center gap-2"><MapPin size={14} className="text-red-500"/> {booking.showtime?.room?.name}</p>
                                    <p className="flex items-center gap-2"><Clock size={14} className="text-red-500"/> {formatDate(booking.showtime?.startTime)}</p>
                                    <p className="flex items-center gap-2 text-white font-medium">
                                        Ghế: {booking.bookingDetails?.map(d => d.seat?.seatCode || d.seat?.code).join(", ")}
                                    </p>
                                    {booking.snacks?.length > 0 && (
                                        <p className="flex items-center gap-2 text-yellow-500">
                                            🍿 {booking.snacks.map(s =>
                                                `${s.snackItem?.name} x${s.quantity}`
                                            ).join(", ")}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Trạng thái & Hành động */}
                            <div className="flex flex-col items-end justify-between gap-4">
                                <div className="flex flex-col items-end">
                                    <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider mb-1
                                        ${status === 'paid' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                                          status === 'pending' || status === 'unpaid' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                                          'bg-neutral-700 text-neutral-400'}`}>
                                        {status === 'paid' ? 'Đã thanh toán' : status === 'pending' || status === 'unpaid' ? 'Chờ thanh toán' : 'Đã hủy'}
                                    </span>
                                    <span className="text-xl font-bold text-white">{formatCurrency(booking.totalPrice)}</span>
                                </div>

                                {/* Nút hành động */}
                                <div className="flex gap-2">
                                    {(status === 'pending' || status === 'unpaid') && (
                                        <button 
                                            onClick={() => navigate(`/payment/${booking.id}`)}
                                            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                                        >
                                            <CreditCard size={16}/> Thanh toán ngay
                                        </button>
                                    )}

                                    {status === 'paid' && (
                                        <button 
                                            onClick={() => handleShowQR(booking)}
                                            className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                                        >
                                            <QrCode size={16}/> Vé vào rạp
                                        </button>
                                    )}

                                    {status === 'cancelled' && (
                                        <span className="flex items-center gap-2 text-neutral-500 text-sm italic">
                                            <XCircle size={16}/> Vé đã bị hủy
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};

export default MyBookings;