import React, { useState, useEffect } from "react";
import { roomService } from "../../services/roomService";
import RoomForm from "./RoomForm";
import SeatDesigner from "./SeatDesigner";
import Swal from "sweetalert2";
import { useApiCall } from "../../hooks/useApiCall";
import { LoadingSkeleton } from "./LoadingSpinner";
import { Monitor, Plus, Trash2, Edit, Grid3X3, Armchair } from "lucide-react";

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [view, setView] = useState("LIST");
  const [selectedRoom, setSelectedRoom] = useState(null);

  const { loading, execute } = useApiCall();

  const loadRooms = async () => {
    await execute(() => roomService.getRooms(), {
      onSuccess: (res) => {
        setRooms(res.data.result || []);
      },
      errorMessage: "Lỗi tải danh sách phòng",
    });
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleDeleteRoom = async (id, name) => {
    const result = await Swal.fire({
      title: `Xóa phòng ${name}?`,
      text: "Hành động này không thể hoàn tác! Toàn bộ ghế sẽ bị xóa.",
      icon: "warning",
      background: "#171717",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#404040",
      confirmButtonText: "Xóa ngay",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      await execute(
        () => roomService.deleteRoom(id),
        {
          successMessage: "Đã xóa phòng thành công!",
          onSuccess: () => loadRooms(),
        }
      );
    }
  };

  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setView("CREATE");
  };

  if (view === "CREATE") {
    return (
      <RoomForm
        roomData={selectedRoom}
        onBack={() => {
          setView("LIST");
          setSelectedRoom(null);
          loadRooms();
        }}
      />
    );
  }

  if (view === "DESIGN") {
    return (
      <SeatDesigner
        room={selectedRoom}
        onBack={() => {
          setView("LIST");
          setSelectedRoom(null);
        }}
      />
    );
  }

  return (
    <div className="p-4 md:p-8 text-white w-full font-body">
      <div className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tight flex items-center gap-3">
            <span className="p-2 bg-red-600/10 rounded-lg text-red-500 border border-red-600/20">
              <Monitor size={24} />
            </span>
            Quản Lý Phòng Chiếu
          </h2>
          <p className="text-neutral-500 text-sm mt-1">
            Quản lý sơ đồ và kích thước phòng chiếu
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedRoom(null);
            setView("CREATE");
          }}
          className="bg-red-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-red-700 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={20} /> Thêm Phòng
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="group bg-neutral-800/50 p-6 rounded-xl border border-neutral-800 hover:border-red-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3
                    className="text-xl font-bold font-display text-white group-hover:text-red-500 transition-colors truncate"
                    title={room.name}
                  >
                    {room.name}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-neutral-900 p-3 rounded border border-neutral-700">
                    <p className="text-neutral-500 text-xs uppercase mb-1 flex items-center gap-1">
                      <Grid3X3 size={12} /> Kích thước
                    </p>
                    <p className="font-mono text-white font-bold">
                      {room.totalRows} x {room.totalCols}
                    </p>
                  </div>
                  <div className="bg-neutral-900 p-3 rounded border border-neutral-700">
                    <p className="text-neutral-500 text-xs uppercase mb-1 flex items-center gap-1">
                      <Armchair size={12} /> Tổng ghế
                    </p>
                    <p className="font-mono text-white font-bold">
                      {room.totalRows * room.totalCols}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-700/50">
                <button
                  onClick={() => handleEditRoom(room)}
                  className="px-3 py-2 bg-neutral-700 text-neutral-300 rounded hover:bg-white hover:text-black font-bold transition-colors flex items-center gap-2 text-sm"
                >
                  <Edit size={14} /> Sửa
                </button>
                <button
                  onClick={() => {
                    setSelectedRoom(room);
                    setView("DESIGN");
                  }}
                  className="flex-1 bg-neutral-700 text-white py-2 rounded hover:bg-red-600 font-bold text-sm transition-colors border border-neutral-600 hover:border-red-600"
                >
                  Thiết kế ghế
                </button>
                <button
                  onClick={() => handleDeleteRoom(room.id, room.name)}
                  className="px-3 py-2 bg-neutral-800 text-neutral-500 rounded hover:bg-red-600 hover:text-white border border-neutral-700 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageRooms;
