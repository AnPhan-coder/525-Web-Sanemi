import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, ShoppingBag } from "lucide-react";
import { snackService } from "../../../services/snackService";
import { useApiCall } from "../../../hooks/useApiCall";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const CATEGORIES = [
  { value: "POPCORN", label: "🍿 Bắp" },
  { value: "DRINK", label: "🥤 Nước" },
  { value: "COMBO", label: "🎁 Combo" },
];

const EMPTY_FORM = { name: "", price: "", category: "POPCORN", imageUrl: "", available: true };

const ManageSnacks = () => {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { loading, execute } = useApiCall();

  const loadItems = () => {
    execute(() => snackService.getAdminMenu(), {
      onSuccess: (res) => setItems(res.data?.result || res.data || []),
      showSuccessToast: false,
    });
  };

  useEffect(() => { loadItems(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.warning("Vui lòng nhập đủ tên và giá");
      return;
    }
    const payload = { ...form, price: Number(form.price) };
    await execute(
      () => editingId ? snackService.updateItem(editingId, payload) : snackService.createItem(payload),
      {
        successMessage: editingId ? "Đã cập nhật sản phẩm" : "Đã thêm sản phẩm",
        onSuccess: () => { loadItems(); handleCancel(); },
      }
    );
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({ name: item.name, price: item.price, category: item.category, imageUrl: item.imageUrl || "", available: item.available });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleToggle = async (item) => {
    await execute(() => snackService.toggleAvailability(item.id), {
      successMessage: item.available ? "Đã ẩn sản phẩm" : "Đã hiện sản phẩm",
      onSuccess: loadItems,
    });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Xóa sản phẩm?",
      text: "Chỉ xóa được nếu sản phẩm chưa có trong đơn hàng nào!",
      icon: "warning",
      background: "#171717",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#404040",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then(async (res) => {
      if (res.isConfirmed) {
        await execute(() => snackService.deleteItem(id), {
          successMessage: "Đã xóa sản phẩm",
          onSuccess: loadItems,
        });
      }
    });
  };

  return (
    <div className="p-4 md:p-8 text-white font-body max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-6">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500 border border-yellow-500/20">
            <ShoppingBag size={24} />
          </span>
          <div>
            <h2 className="text-2xl font-display font-bold uppercase">Quản lý Bắp & Nước</h2>
            <p className="text-neutral-500 text-sm mt-0.5">Thêm, sửa, ẩn/hiện các sản phẩm trong menu</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
          className="bg-yellow-500 text-neutral-900 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-yellow-400 transition-colors"
        >
          <Plus size={18} /> Thêm mới
        </button>
      </div>

      {/* Form thêm/sửa */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 mb-6 space-y-4">
          <h3 className="font-bold text-lg">{editingId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-neutral-400 font-bold mb-1 block">Tên sản phẩm</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Bắp lớn phô mai..."
                className="w-full p-2.5 bg-neutral-900 border border-neutral-600 rounded-lg text-white outline-none focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="text-sm text-neutral-400 font-bold mb-1 block">Giá (VND)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="35000"
                className="w-full p-2.5 bg-neutral-900 border border-neutral-600 rounded-lg text-white outline-none focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="text-sm text-neutral-400 font-bold mb-1 block">Danh mục</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full p-2.5 bg-neutral-900 border border-neutral-600 rounded-lg text-white outline-none focus:border-yellow-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-neutral-400 font-bold mb-1 block">URL ảnh (tuỳ chọn)</label>
              <input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full p-2.5 bg-neutral-900 border border-neutral-600 rounded-lg text-white outline-none focus:border-yellow-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-400">Trạng thái:</span>
            <button
              type="button"
              onClick={() => setForm({ ...form, available: !form.available })}
              className={`flex items-center gap-2 text-sm font-bold px-3 py-1 rounded-full border transition-all ${
                form.available ? "border-green-600 text-green-400 bg-green-900/20" : "border-neutral-600 text-neutral-400"
              }`}
            >
              {form.available ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              {form.available ? "Đang bán" : "Đã ẩn"}
            </button>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="px-6 py-2 bg-yellow-500 text-neutral-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors">
              {loading ? "Đang lưu..." : editingId ? "Cập nhật" : "Thêm mới"}
            </button>
            <button type="button" onClick={handleCancel} className="px-6 py-2 bg-neutral-700 text-neutral-300 font-bold rounded-lg hover:bg-neutral-600 transition-colors">
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Bảng danh sách */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-neutral-500 text-center py-12">Chưa có sản phẩm nào.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                item.available ? "bg-neutral-800 border-neutral-700" : "bg-neutral-800/40 border-neutral-800 opacity-60"
              }`}
            >
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-14 h-14 object-cover rounded-lg bg-neutral-700 shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-neutral-700 flex items-center justify-center shrink-0 text-2xl">
                  {item.category === "POPCORN" ? "🍿" : item.category === "DRINK" ? "🥤" : "🎁"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate">{item.name}</p>
                <div className="flex gap-3 text-xs text-neutral-400 mt-0.5">
                  <span>{CATEGORIES.find((c) => c.value === item.category)?.label}</span>
                  <span className="text-yellow-500 font-semibold">{item.price?.toLocaleString("vi-VN")} đ</span>
                  <span className={item.available ? "text-green-400" : "text-neutral-500"}>
                    {item.available ? "Đang bán" : "Đã ẩn"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleToggle(item)} title={item.available ? "Ẩn" : "Hiện"} className="p-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 transition-colors">
                  {item.available ? <ToggleRight size={16} className="text-green-400" /> : <ToggleLeft size={16} className="text-neutral-400" />}
                </button>
                <button onClick={() => handleEdit(item)} className="p-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 transition-colors">
                  <Pencil size={16} className="text-neutral-300" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg bg-neutral-700 hover:bg-red-900/40 hover:border-red-500 transition-colors border border-transparent">
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageSnacks;
