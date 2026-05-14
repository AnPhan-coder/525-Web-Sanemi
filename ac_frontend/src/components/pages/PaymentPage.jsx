import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { bookingService } from "../../services/bookingService";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  Clock,
  ArrowLeft,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Snack data passed from SnackPage via navigate state
  const snacks = location.state?.snacks || [];
  const snackTotal = location.state?.snackTotal || 0;

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); 
  const timerRef = useRef(null);

  const parseDate = (dateInput) => {
    if (!dateInput) return null;
    if (Array.isArray(dateInput)) {
      return new Date(
        dateInput[0],
        dateInput[1] - 1, 
        dateInput[2],
        dateInput[3],
        dateInput[4],
        dateInput[5] || 0
      ).getTime();
    }
    return new Date(dateInput).getTime();
  };

  useEffect(() => {
    if (!bookingId || bookingId === "undefined" || bookingId === "null") {
      toast.error("Mã vé không hợp lệ!");
      navigate("/");
      return;
    }

    const fetchBookingDetail = async () => {
      try {
        const res = await bookingService.getBookingById(bookingId);
        if (res.data.result) {
          const data = res.data.result;
          setBooking(data);

          const bookingTime = parseDate(data.bookingTime);

          if (bookingTime) {
            const now = new Date().getTime();
            const diffInSeconds = Math.floor((now - bookingTime) / 1000);
            const remaining = 600 - diffInSeconds; 

            setTimeLeft(remaining > 0 ? remaining : 0);
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Không tìm thấy thông tin vé hoặc vé đã bị hủy!");
        navigate("/");
      } finally {
        setPageLoading(false);
      }
    };
    fetchBookingDetail();
  }, [bookingId, navigate]);

  useEffect(() => {
    if (pageLoading || !booking) return;

    if (timeLeft <= 0) {
      if (booking.status === "UNPAID" && !loading) {
        handleCancelBooking(true);
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft, booking, pageLoading, loading]);

  const formatTime = (s) => {
    if (s < 0) return "0:00";
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  };

  const handleCancelBooking = async (isAuto = false) => {
    try {
      if (!isAuto) setLoading(true); 

      if (booking?.status === "PAID") return;

      await bookingService.cancelBooking(bookingId);

      if (!isAuto) {
        toast.info("Đã hủy giữ ghế.");
        navigate(booking?.showtime ? `/booking/${booking.showtime.id}` : "/");
      } else {        
        Swal.fire({
          icon: "warning",
          title: "Hết thời gian giữ ghế",
          text: "Vui lòng thực hiện đặt vé lại.",
          confirmButtonColor: "#EAB308",
          background: "#171717",
          color: "#fff",
        }).then(() => {
          navigate("/");
        });
      }
    } catch (e) {
      console.error("Lỗi hủy vé:", e);
    } finally {
      if (!isAuto) setLoading(false);
    }
  };

  const handleVNPayPayment = async () => {
    if (timeLeft <= 0) {
      toast.warning("Vé đã hết hạn thanh toán!");
      return;
    }
    setLoading(true);
    try {
      const res = await bookingService.createVnpayPayment(bookingId);
      const paymentUrl = res.data.result || res.data;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        toast.error("Không lấy được đường dẫn thanh toán!");
      }
    } catch (error) {
      toast.error(
        "Lỗi VNPay: " + (error.response?.data?.message || "Server Error")
      );
      setLoading(false);
    }
  };


  if (pageLoading)
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );

  return (
    <div className="pt-24 pb-20 min-h-screen bg-neutral-900 text-white px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => handleCancelBooking(false)}
          className="mb-6 flex items-center gap-2 text-neutral-400 hover:text-yellow-500 transition-colors"
        >
          <ArrowLeft size={20} /> Hủy & Quay lại
        </button>

        <div className="bg-neutral-800 rounded-xl overflow-hidden shadow-2xl border border-neutral-700 grid md:grid-cols-3">
          <div className="md:col-span-1 bg-neutral-800 border-r border-neutral-700 p-6 flex flex-col items-center text-center">
            <img
              src={booking?.showtime?.movie?.posterUrl}
              alt="Poster"
              className="w-40 rounded-lg shadow-lg mb-4 border border-neutral-600"
            />
            <h3 className="text-xl font-bold text-yellow-500 uppercase">
              {booking?.showtime?.movie?.title}
            </h3>
            <p className="text-neutral-300 font-bold mt-2">
              {booking?.showtime?.room?.name}
            </p>
            <div className="mt-6 w-full border-t border-neutral-700 pt-4 text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Suất chiếu:</span>
                <span className="font-bold">
                  {booking?.showtime?.startTime &&
                    new Date(
                      parseDate(booking.showtime.startTime)
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Ngày:</span>
                <span className="font-bold">
                  {booking?.showtime?.startTime &&
                    new Date(
                      parseDate(booking.showtime.startTime)
                    ).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-neutral-500">Ghế:</span>
                <span className="font-bold text-yellow-500 text-right max-w-[50%] break-words">
                  {booking?.bookingDetails
                    ?.map((d) => d.seat.seatCode)
                    .join(", ")}
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 p-8 relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold uppercase tracking-wide">
                Thanh Toán
              </h2>
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded border ${
                  timeLeft < 60
                    ? "text-red-500 bg-red-500/10 border-red-500/20 animate-pulse"
                    : "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
                }`}
              >
                <Clock size={18} />{" "}
                <span className="font-mono font-bold text-lg">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            <div className="mb-8 p-4 bg-neutral-900/50 rounded border border-neutral-700">
              <p className="text-neutral-400 text-sm mb-3 text-center">Tóm tắt đơn hàng</p>
              <div className="space-y-2 text-sm mb-3">
                <div className="flex justify-between text-neutral-300">
                  <span>Vé xem phim ({booking?.bookingDetails?.length || 0} vé)</span>
                  <span>{booking?.totalPrice?.toLocaleString("vi-VN")} đ</span>
                </div>
                {snacks.length > 0 && (
                  <div className="flex justify-between text-neutral-300">
                    <span>🍿 Bắp & Nước ({snacks.reduce((s, i) => s + i.quantity, 0)} món)</span>
                    <span>{snackTotal.toLocaleString("vi-VN")} đ</span>
                  </div>
                )}
              </div>
              <div className="border-t border-neutral-700 pt-3 text-center">
                <p className="text-neutral-400 text-xs mb-1">Tổng tiền thanh toán</p>
                <div className="text-3xl font-bold text-yellow-500">
                  {((booking?.totalPrice || 0) + snackTotal).toLocaleString("vi-VN")} đ
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div
                onClick={handleVNPayPayment}
                className="p-4 rounded-lg border border-neutral-600 bg-neutral-700/30 hover:bg-blue-900/20 hover:border-blue-500 transition-all cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white p-1 rounded h-12 w-12 flex items-center justify-center">
                    <img
                      src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-VNPAY-QR.png"
                      className="w-full object-contain"
                      alt="VNPay"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">
                      Thanh toán qua VNPay
                    </h4>
                    <p className="text-xs text-neutral-400">
                      Thẻ ATM, Visa, MasterCard, QR Code
                    </p>
                  </div>
                </div>
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500"></div>
                ) : (
                  <CreditCard className="text-neutral-500 group-hover:text-blue-400" />
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-2 items-center justify-center text-xs text-neutral-500">
              <ShieldCheck size={14} /> Thanh toán bảo mật và mã hóa bởi VNPay
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PaymentPage;
