import React, { useState, useEffect, useMemo } from "react";
import { roomService } from "../../services/roomService";
import { toast } from "react-toastify";

const RoomForm = ({ roomData, onBack }) => {
  const isEdit = !!roomData;

  const [formData, setFormData] = useState({
    name: "",
    cinemaId: 1,
    totalRows: 10,
    totalCols: 10,
    templateType: "STANDARD",
  });

  const TEMPLATES = [
    {
      id: "STANDARD",
      name: "Mẫu Tiêu Chuẩn",
      desc: "Toàn bộ ghế thường",
      rows: 10,
      cols: 12,
    },
    {
      id: "VIP_HALL",
      name: "Phòng VIP",
      desc: "3 hàng đầu thường, còn lại VIP",
      rows: 10,
      cols: 15,
    },
    {
      id: "COUPLE_SWEET",
      name: "Phòng Couple",
      desc: "Có ghế đôi ở 2 hàng cuối",
      rows: 12,
      cols: 12,
    },
  ];

  useEffect(() => {
    if (isEdit && roomData) {
      setFormData({
        name: roomData.name,
        cinemaId: roomData.cinema?.id || 1,
        totalRows: roomData.totalRows,
        totalCols: roomData.totalCols,
        templateType: "STANDARD",
      });
    }
  }, [isEdit, roomData]);

  const handleTemplateSelect = (tpl) => {
    if (isEdit) return;
    setFormData({
      ...formData,
      templateType: tpl.id,
      totalRows: tpl.rows,
      totalCols: tpl.cols,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await roomService.updateRoom(roomData.id, {
          name: formData.name,
        });
        toast.success("Cập nhật tên phòng thành công!");
      } else {
        await roomService.createRoom(formData);
        toast.success("Tạo phòng thành công!");
      }
      onBack();
    } catch (error) {
      toast.error("Lỗi: " + (error.response?.data?.message || "Lỗi server"));
    }
  };

  const renderPreview = useMemo(() => {
    const grid = [];
    const rows = formData.totalRows;
    const cols = formData.totalCols;
    const tpl = formData.templateType;

    for (let r = 1; r <= rows; r++) {
      const rowCells = [];
      for (let c = 1; c <= cols; c++) {
        let type = "NORMAL";
        let isHidden = false;

        if (tpl === "VIP_HALL" && r > 3) type = "VIP";
        else if (tpl === "COUPLE_SWEET") {
          if (r > rows - 2) {
            if (c % 2 !== 0) type = "COUPLE";
            else isHidden = true;
          } else if (r > rows - 5) type = "VIP";
        }

        if (isHidden) continue;

        let cellClass = "w-4 h-4 bg-neutral-600 rounded-sm";
        if (type === "VIP") cellClass = "w-4 h-4 bg-red-600 rounded-sm";
        if (type === "COUPLE")
          cellClass = "w-10 h-4 bg-pink-600 rounded-sm col-span-2";

        rowCells.push(
          <div
            key={`${r}-${c}`}
            className={`${cellClass} border border-black/20`}
          ></div>
        );
      }
      grid.push(
        <div key={r} className="flex justify-center gap-1 mb-1">
          {rowCells}
        </div>
      );
    }
    return grid;
  }, [formData.totalRows, formData.totalCols, formData.templateType]);

  return (
    <div className="bg-neutral-800 p-8 rounded-xl border border-neutral-700 max-w-5xl mx-auto flex flex-col md:flex-row gap-8 shadow-xl">
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-red-500 pl-4 uppercase">
          {isEdit ? "Chỉnh Sửa Tên Phòng" : "Thêm Phòng Mới"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-neutral-400 mb-2 font-medium text-sm">
              Tên Phòng
            </label>
            <input
              type="text"
              required
              className="w-full bg-neutral-900 border border-neutral-700 p-3 rounded-lg text-white focus:border-red-500 outline-none transition-colors"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          {!isEdit && (
            <div>
              <label className="block text-neutral-400 mb-3 font-medium text-sm">
                Chọn Mẫu Sơ Đồ:
              </label>
              <div className="space-y-3">
                {TEMPLATES.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => handleTemplateSelect(tpl)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${
                      formData.templateType === tpl.id
                        ? "bg-neutral-700 border-red-500 ring-1 ring-red-500"
                        : "bg-neutral-900 border-neutral-700 hover:bg-neutral-800"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white text-sm">
                        {tpl.name}
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">
                        {tpl.desc}
                      </div>
                    </div>
                    <span className="text-xs font-mono bg-black/30 px-2 py-1 rounded text-neutral-300">
                      {tpl.rows}x{tpl.cols}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isEdit && (
            <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-neutral-900/50 rounded-lg border border-neutral-700">
              <div>
                <label className="block text-neutral-500 text-xs mb-1 uppercase font-bold">
                  Số Hàng
                </label>
                <input
                  type="number"
                  min="5"
                  max="25"
                  className="w-full bg-neutral-800 text-white p-2 rounded border border-neutral-600 focus:border-red-500 outline-none"
                  value={formData.totalRows}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalRows: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-neutral-500 text-xs mb-1 uppercase font-bold">
                  Số Cột
                </label>
                <input
                  type="number"
                  min="5"
                  max="30"
                  className="w-full bg-neutral-800 text-white p-2 rounded border border-neutral-600 focus:border-red-500 outline-none"
                  value={formData.totalCols}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalCols: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 bg-neutral-700 text-white rounded-lg font-bold hover:bg-neutral-600 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
            >
              {isEdit ? "CẬP NHẬT" : "XÁC NHẬN TẠO"}
            </button>
          </div>
        </form>
      </div>

      {!isEdit && (
        <div className="flex-1 bg-neutral-900/50 p-6 rounded-xl border border-neutral-800 flex flex-col items-center justify-center min-h-[400px]">
          <h3 className="text-neutral-500 uppercase tracking-widest text-xs mb-8 font-bold">
            Xem trước bố cục
          </h3>
          <div className="scale-90">{renderPreview}</div>
          <div className="w-1/2 h-1 bg-red-500/30 mt-8 rounded-full"></div>
          <p className="text-[10px] text-neutral-600 mt-2 uppercase">
            Màn hình
          </p>
        </div>
      )}
    </div>
  );
};

export default RoomForm;
