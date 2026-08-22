import React, { useState, useEffect } from "react";
import { seatService } from "../../../services/roomService";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { ArrowLeft, Save, CheckCircle2 } from "lucide-react";
import SeatIcon from "../booking/SeatIcon";



const SeatDesigner = ({ room, onBack }) => {
  const [seats, setSeats] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [selectedTool, setSelectedTool] = useState("NORMAL");

  useEffect(() => { if (room) loadSeats(); }, [room]);

  const loadSeats = async () => {
    try {
      const res = await seatService.getSeatsByRoomId(room.id);
      const sortedSeats = res.data.result?.sort((a, b) => 
        a.rowIndex === b.rowIndex ? a.colIndex - b.colIndex : a.rowIndex - b.rowIndex
      ) || [];
      setSeats(sortedSeats);
      setIsDirty(false);
    } catch (error) { console.error(error); }
  };

  const handleCellClick = (r, c) => {
    const seatIndex = seats.findIndex((s) => s.rowIndex === r && s.colIndex === c);
    if (seatIndex === -1) return;

    const newSeats = [...seats];
    const seat = newSeats[seatIndex];

    if (selectedTool === "TOGGLE") {
      seat.active = !seat.active;
    } else if (selectedTool === "COUPLE") {
      if (c % 2 !== 0 && c < room.totalCols) {
        seat.type = "COUPLE";
        seat.active = true;
        const nextSeat = newSeats.find((s) => s.rowIndex === r && s.colIndex === c + 1);
        if (nextSeat) nextSeat.active = false;
      }
    } else {
      seat.type = selectedTool;
      seat.active = true;
      const nextSeat = newSeats.find((s) => s.rowIndex === r && s.colIndex === c + 1);
      if(nextSeat && !nextSeat.active && seat.type !== 'COUPLE') {
          nextSeat.active = true;
      }
    }
    setSeats(newSeats);
    setIsDirty(true);
  };

  const handleSave = async () => {
     Swal.fire({
      title: "Lưu thay đổi?",
      text: "Cập nhật sơ đồ ghế mới cho hệ thống.",
      icon: "question",
      background: "#171717",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#404040",
      confirmButtonText: "Lưu ngay",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await seatService.batchUpdateSeats(seats);
          toast.success("✅ Đã lưu sơ đồ thành công!");
          setIsDirty(false);
        } catch (error) {
          toast.error("❌ Lỗi: " + error.message);
        }
      }
    });
  };

  const renderGrid = () => {
    const grid = [];
    for (let r = 1; r <= room.totalRows; r++) {
      const rowCells = [];
      const rowLabel = String.fromCharCode(64 + r);

      for (let c = 1; c <= room.totalCols; c++) {
        const seat = seats.find((s) => s.rowIndex === r && s.colIndex === c);
        
        if (seat && seats.find((s) => s.rowIndex === r && s.colIndex === c - 1)?.type === "COUPLE" && seats.find((s) => s.rowIndex === r && s.colIndex === c - 1)?.active) continue;

        rowCells.push(
          <div key={`${r}-${c}`} className="m-0.5 md:m-1">
            <SeatIcon 
              type={seat?.type || "NORMAL"} 
              isHidden={!seat?.active} 
              label={seat?.code ? seat.code.substring(1) : ""} 
              onClick={() => seat && handleCellClick(r, c)}
              className={seat?.type === "COUPLE" ? "w-16 h-8 md:w-20 md:h-10" : "w-8 h-8 md:w-10 md:h-10"}
            />
          </div>
        );
      }
      grid.push(
        <div key={r} className="flex justify-center items-center whitespace-nowrap mb-1">
          <span className="w-6 text-center text-neutral-500 font-bold text-xs mr-2">{rowLabel}</span>
          {rowCells}
          <span className="w-6 text-center text-neutral-500 font-bold text-xs ml-2">{rowLabel}</span>
        </div>
      );
    }
    return grid;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-neutral-900 text-white w-full font-body">
      <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-800 bg-neutral-900 z-20">
        <div>
          <button onClick={onBack} className="flex items-center gap-2 text-neutral-400 hover:text-white text-sm mb-1 transition-colors">
            <ArrowLeft size={16} /> Quay lại
          </button>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Thiết kế: <span className="text-red-500">{room.name}</span>
          </h2>
        </div>

        <div className="flex items-center gap-6">
          <div className="bg-neutral-800 p-1 rounded-lg flex gap-1 border border-neutral-700">
            {[
              { id: "NORMAL", label: "Thường", color: "bg-neutral-600" },
              { id: "VIP", label: "VIP", color: "bg-red-600" },
              { id: "COUPLE", label: "Couple", color: "bg-pink-600" },
              { id: "TOGGLE", label: "Ẩn/Hiện", color: "bg-yellow-600 text-black" },
            ].map((tool) => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                  selectedTool === tool.id ? `${tool.color} text-white` : "text-neutral-400 hover:bg-neutral-700"
                }`}
              >
                {tool.label}
              </button>
            ))}
          </div>
          <button onClick={handleSave} disabled={!isDirty} className={`px-5 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${isDirty ? "bg-red-600 text-white" : "bg-neutral-800 text-neutral-500"}`}>
             {isDirty ? <Save size={18} /> : <CheckCircle2 size={18} />}
             {isDirty ? "Lưu lại" : "Đã lưu"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative bg-neutral-900/50">
        <div className="absolute inset-0 overflow-auto p-8 flex justify-center">
          <div className="bg-neutral-800/30 p-8 rounded-2xl border border-neutral-800/50 backdrop-blur-sm h-fit">
            {renderGrid()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatDesigner;
