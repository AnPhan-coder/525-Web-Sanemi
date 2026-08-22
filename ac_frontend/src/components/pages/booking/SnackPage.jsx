import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ShoppingCart, ArrowRight, SkipForward, Plus, Minus, Popcorn, Coffee } from "lucide-react";
import { toast } from "react-toastify";
import { snackService } from "../../../services/snackService";
import { bookingService } from "../../../services/bookingService";
import { useApiCall } from "../../../hooks/useApiCall";
import { formatCurrency } from "../../../utils/bookingHelpers";

const CATEGORY_TABS = [
  { id: "ALL", label: "Tất cả" },
  { id: "POPCORN", label: "🍿 Bắp" },
  { id: "DRINK", label: "🥤 Nước" },
  { id: "COMBO", label: "🎁 Combo" },
];

const SnackPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { execute } = useApiCall();

  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({}); // { snackItemId: quantity }
  const [activeTab, setActiveTab] = useState("ALL");
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    execute(() => snackService.getMenu(), {
      onSuccess: (res) => setMenu(res.data?.result || res.data || []),
      showSuccessToast: false,
    });
    execute(() => bookingService.getBookingById(bookingId), {
      onSuccess: (res) => setBooking(res.data?.result || res.data),
      showSuccessToast: false,
    });
  }, [bookingId]);

  const filteredMenu = useMemo(() => {
    if (activeTab === "ALL") return menu;
    return menu.filter((item) => item.category === activeTab);
  }, [menu, activeTab]);

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => {
          const item = menu.find((m) => m.id === Number(id));
          return item ? { ...item, quantity: qty } : null;
        })
        .filter(Boolean),
    [cart, menu]
  );

  const seatTotal = useMemo(() => {
    return booking?.bookingDetails?.reduce((sum, item) => sum + (item.price || 0), 0) || 0;
  }, [booking]);
  const snackTotal = useMemo(() => {
    return cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }, [cartItems]);
  const grandTotal = useMemo(() => {
    return seatTotal + snackTotal;
  }, [seatTotal, snackTotal]);

  const handleAdd = (itemId) => {
    setCart((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const handleRemove = (itemId) => {
    setCart((prev) => {
      const qty = (prev[itemId] || 0) - 1;
      if (qty <= 0) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: qty };
    });
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleContinue = async () => {
    if (isSaving) return;
    const selectedSnacks = cartItems.map((i) => ({
      snackItemId: i.id,
      quantity: i.quantity,
      unitPrice: i.price,
    }));
    try {
      setIsSaving(true);
      if (selectedSnacks.length > 0) {
        // Lưu snack vào DB và cập nhật tổng tiền
        await bookingService.addSnacks(bookingId, selectedSnacks);
      }
      navigate(`/payment/${bookingId}`, { state: { snacks: selectedSnacks, snackTotal } });
    } catch {
      toast.error("Đã có lỗi khi lưu bắp nước. Vui lòng thử lại!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    navigate(`/payment/${bookingId}`, { state: { snacks: [], snackTotal: 0 } });
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-body pt-20 pb-32">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-display font-bold uppercase tracking-wider flex items-center justify-center gap-3">
            <Popcorn size={28} className="text-yellow-500" />
            Chọn Bắp &amp; Nước
          </h2>
          <p className="text-neutral-500 text-sm mt-1">Thêm vào giỏ hàng hoặc bỏ qua để thanh toán ngay</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu */}
          <div className="lg:col-span-2 space-y-5">
            {/* Tabs */}
            <div className="flex gap-2 bg-neutral-800 p-1 rounded-lg w-fit">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                    activeTab === tab.id
                      ? "bg-yellow-500 text-neutral-900 shadow"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Item list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredMenu.map((item) => {
                const qty = cart[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className={`bg-neutral-800 rounded-xl border p-4 flex gap-4 items-center transition-all ${
                      qty > 0 ? "border-yellow-500/50" : "border-neutral-700"
                    }`}
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg shrink-0 bg-neutral-700"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-neutral-700 flex items-center justify-center shrink-0">
                        <Coffee size={24} className="text-neutral-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate">{item.name}</p>
                      <p className="text-yellow-500 text-sm font-semibold">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {qty > 0 && (
                        <>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="w-7 h-7 rounded-full bg-neutral-700 hover:bg-neutral-600 flex items-center justify-center"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-5 text-center font-bold text-sm">{qty}</span>
                        </>
                      )}
                      <button
                        onClick={() => handleAdd(item.id)}
                        className="w-7 h-7 rounded-full bg-yellow-500 hover:bg-yellow-400 text-neutral-900 flex items-center justify-center"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredMenu.length === 0 && (
                <p className="text-neutral-500 text-sm col-span-2 py-8 text-center">
                  Không có sản phẩm nào.
                </p>
              )}
            </div>
          </div>

          {/* Giỏ hàng (sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-neutral-800 rounded-xl border border-neutral-700 p-5 space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <ShoppingCart size={18} className="text-yellow-500" />
                Đơn hàng
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-neutral-400">
                  <span>Vé xem phim</span>
                  <span>{formatCurrency(seatTotal)}</span>
                </div>
                {cartItems.map((i) => (
                  <div key={i.id} className="flex justify-between">
                    <span className="truncate max-w-[150px]">
                      {i.name} ×{i.quantity}
                    </span>
                    <span>{formatCurrency(i.price * i.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-700 pt-3 flex justify-between font-bold">
                <span>Tổng cộng</span>
                <span className="text-yellow-500">{formatCurrency(grandTotal)}</span>
              </div>

              <button
                onClick={handleContinue}
                disabled={isSaving}
                className={`w-full py-3 rounded-lg font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  isSaving
                    ? "bg-neutral-600 text-neutral-400 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-400 text-neutral-900"
                }`}
              >
                {isSaving ? "Đang lưu..." : (<>Tiếp tục <ArrowRight size={18} /></>)}
              </button>

              <button
                onClick={handleSkip}
                className="w-full py-2 text-neutral-400 hover:text-white text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <SkipForward size={16} /> Bỏ qua, thanh toán ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnackPage;
