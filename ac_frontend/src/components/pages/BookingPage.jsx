import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard } from "lucide-react";
import { useBooking } from "../../hooks/useBooking";
import BookingSeat from "./BookingSeat";
import { formatCurrency } from "../../utils/bookingHelpers";

const BookingPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const showtimeId = params.id || params.showtimeId;

  const {
    loading,
    seats,
    seatsByRow,
    selectedSeats,
    totalPrice,
    roomTypes,
    aisleConfig,
    handleSelectSeat,
    handleBookingSubmit,
  } = useBooking(showtimeId);

  if (!showtimeId) return <div className="text-red-500 text-center mt-20">Lỗi ID</div>;
  if (loading && seats.length === 0) return <div className="text-yellow-500 text-center mt-20">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col font-body">
      {/* HEADER */}
      <div className="pt-24 pb-4 text-center px-4 relative">
        <button onClick={() => navigate(-1)} className="absolute left-4 top-24 p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-display font-bold uppercase tracking-widest text-white">Chọn Ghế</h2>
        <p className="text-neutral-500 text-sm mt-1">Màn hình phía trước</p>
      </div>

      <div className="w-full flex flex-col items-center mb-10 px-4">
        <div className="w-full max-w-3xl h-1.5 bg-gradient-to-r from-transparent via-red-600 to-transparent rounded-full shadow-[0_5px_20px_rgba(220,38,38,0.4)]"></div>
      </div>

      {/* GRID GHẾ */}
      <div className="flex-1 overflow-x-auto px-4 pb-40 custom-scrollbar">
        <div className="min-w-max flex flex-col items-center gap-3 mx-auto pb-10">
          {Object.entries(seatsByRow).map(([rowLabel, rowSeats]) => (
            <div key={rowLabel} className="flex items-end">
              <span className="w-8 text-center text-neutral-500 font-bold mb-2 mr-2">{rowLabel}</span>
              
              <div className="flex items-end">
                {rowSeats.map((seat, index) => {
                  
                  if (
                    index > 0 &&
                    rowSeats[index - 1].type === "COUPLE" &&
                    rowSeats[index - 1].colIndex === seat.colIndex - 1
                  ) {
                    return null;
                  }

                  return (
                    <BookingSeat
                      key={seat.id}
                      seat={seat}
                      isSelected={selectedSeats.includes(seat.id)}
                      onSelect={() => handleSelectSeat(seat)}
                      isAisle={aisleConfig && aisleConfig.includes(seat.colIndex)}
                    />
                  );
                })}
              </div>

              <span className="w-8 text-center text-neutral-500 font-bold mb-2 ml-2">{rowLabel}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-24 left-0 w-full pointer-events-none z-10">
          <div className="flex justify-center gap-4 sm:gap-6 text-xs text-neutral-400 bg-neutral-900/90 backdrop-blur-md py-3 px-6 mx-auto w-fit rounded-full border border-neutral-800 pointer-events-auto shadow-lg">
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-neutral-600 rounded-sm"></div> Thường</div>
          {roomTypes?.hasVip && <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-600 rounded-sm"></div> VIP</div>}
          {roomTypes?.hasCouple && <div className="flex items-center gap-2"><div className="w-8 h-4 bg-pink-600 rounded-sm"></div> Couple</div>}
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-500 rounded-sm"></div> Đang chọn</div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-neutral-800 border border-neutral-600 rounded-sm opacity-50"></div> Đã bán</div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-neutral-800 border-t border-neutral-700 p-4 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        <div className="max-w-6xl mx-auto flex flex-row justify-between items-center gap-4">
          <div>
            <p className="text-neutral-400 text-xs sm:text-sm uppercase tracking-wider">Tạm tính</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold font-display text-yellow-500">{formatCurrency(totalPrice)}</span>
              <span className="text-xs sm:text-sm text-neutral-500">({selectedSeats.length} vé)</span>
            </div>
          </div>
          <button
            onClick={handleBookingSubmit}
            disabled={selectedSeats.length === 0}
            className={`px-6 sm:px-10 py-3 sm:py-3.5 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg ${
              selectedSeats.length > 0
                ? "bg-yellow-500 text-neutral-900 hover:bg-yellow-400 shadow-yellow-500/20 hover:-translate-y-1"
                : "bg-neutral-700 text-neutral-500 cursor-not-allowed"
            }`}
          >
            Thanh toán <CreditCard size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;