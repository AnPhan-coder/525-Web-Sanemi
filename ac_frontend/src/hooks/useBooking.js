import { useState, useEffect, useMemo, useCallback } from "react";
import { bookingService } from "../services/bookingService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useApiCall } from "./useApiCall";
import Swal from "sweetalert2";
import { formatCurrency, getAisleConfig, checkOrphanSeats } from "../utils/bookingHelpers";

export const useBooking = (showtimeId) => {
  const navigate = useNavigate();
  const { loading, execute } = useApiCall();
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!showtimeId || showtimeId === "undefined") {
      return;
    }

    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.warning("🔒 Vui lòng đăng nhập!");
      navigate("/login");
      return;
    }
    setUser(JSON.parse(storedUser));

    execute(
      () => bookingService.getSeatsByShowtime(showtimeId),
      {
        onSuccess: (res) => {
          const raw = res.data.result || [];
          setSeats(raw.filter((s) => s.active !== false));
        },
        showSuccessToast: false,
      }
    );
  }, [showtimeId, navigate]); 

  const seatsByRow = useMemo(() => {
    const rows = {};
    seats.forEach((seat) => {
      if (!seat.code) return;
      const r = seat.code.charAt(0);
      if (!rows[r]) rows[r] = [];
      rows[r].push(seat);
    });
    
    Object.keys(rows).forEach((k) => {
      rows[k].sort((a, b) => Number(a.colIndex) - Number(b.colIndex));
    });
    
    return Object.keys(rows)
      .sort()
      .reduce((obj, key) => {
        obj[key] = rows[key];
        return obj;
      }, {});
  }, [seats]);

  const aisleConfig = useMemo(() => getAisleConfig(seats), [seats]);

  const totalPrice = useMemo(
    () =>
      selectedSeats.reduce((total, id) => {
        const seat = seats.find((s) => s.id === id);
        return total + (seat?.price || 0);
      }, 0),
    [selectedSeats, seats]
  );

  const roomTypes = useMemo(
    () => ({
      hasVip: seats.some((s) => s.type === "VIP"),
      hasCouple: seats.some((s) => s.type === "COUPLE"),
    }),
    [seats]
  );

  const handleSelectSeat = useCallback((seat) => {
    if (seat.booked || !seat.code) return;

    setSelectedSeats((prev) => {
      let seatsToToggle = [seat.id];

      if (seat.type === "COUPLE") {
        const rowCode = seat.code.charAt(0);
        const rowSeats = seatsByRow[rowCode] || [];
        
        const pairSeat = rowSeats.find(
          (s) =>
            s.type === "COUPLE" &&
            s.id !== seat.id &&
            Math.abs(Number(s.colIndex) - Number(seat.colIndex)) === 1 &&
            !s.booked
        );
        
        if (pairSeat) {
          seatsToToggle.push(pairSeat.id);
        }
      }

      const isSelecting = !prev.includes(seat.id);

      if (isSelecting) {
        const newSelection = [...prev];
        seatsToToggle.forEach((id) => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      } else {
        return prev.filter((id) => !seatsToToggle.includes(id));
      }
    });
  }, [seatsByRow]); 

  const handleBookingSubmit = useCallback(async () => {
    if (selectedSeats.length === 0) {
      toast.warning("⚠️ Chọn ít nhất 1 ghế!");
      return;
    }

    const selectedSeatDetails = selectedSeats
      .map((id) => seats.find((s) => s.id === id))
      .filter(Boolean)
      .map((s) => s.code)
      .join(", ");

    Swal.fire({
      title: "Xác nhận đặt vé?",
      html: `
        <div class="text-left">
          <p><strong>Ghế đã chọn:</strong> ${selectedSeatDetails}</p>
          <p><strong>Tổng tiền:</strong> <span class="text-yellow-500 font-bold">${formatCurrency(totalPrice)}</span></p>
        </div>
      `,
      icon: "question",
      background: "#171717",
      color: "#fff",
      showCancelButton: true,
      confirmButtonText: "Thanh toán",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#EAB308",
      cancelButtonColor: "#6b7280",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await bookingService.createBooking({
            userId: user.id,
            showtimeId: Number(showtimeId),
            seatIds: selectedSeats,
          });
          
          toast.success("✅ Đặt vé thành công!");
          const bookingData = response.data?.result || response.data;
          if (bookingData && bookingData.id) {
            navigate(`/payment/${bookingData.id}`);
          }
        } catch (error) {
          toast.error(error.response?.data?.message || "❌ Đặt vé thất bại!");
        }
      }
    });
  }, [selectedSeats, seats, totalPrice, user, showtimeId, navigate, aisleConfig]);

  return {
    loading,
    seats,
    seatsByRow,
    selectedSeats,
    totalPrice,
    roomTypes,
    aisleConfig,
    handleSelectSeat,
    handleBookingSubmit,
  };
};