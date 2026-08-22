package vn.edu.stu.Sanemi.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.edu.stu.Sanemi.Entity.Rooms;
import vn.edu.stu.Sanemi.Entity.Seats;

import vn.edu.stu.Sanemi.Repository.RoomRepository;
import vn.edu.stu.Sanemi.Repository.SeatsRepository;
import vn.edu.stu.Sanemi.Repository.ShowtimesRepository;
import vn.edu.stu.Sanemi.dto.request.RoomRequest;
import vn.edu.stu.Sanemi.dto.request.SeatRequest;
import vn.edu.stu.Sanemi.enums.SeatType;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoomService {
    RoomRepository roomRepository;
    SeatsRepository seatsRepository;

    ShowtimesRepository showtimesRepository;

    @Transactional
    public Rooms createRoom(RoomRequest request) {
        Rooms room = Rooms.builder()
                .name(request.getName())
                .totalCols(request.getTotalCols())
                .totalRows(request.getTotalRows())
                .build();

        String template = request.getTemplateType() != null ? request.getTemplateType() : "STANDARD";

        Rooms savedRoom = roomRepository.save(room);
        generateSeatsByTemplate(savedRoom, request.getTotalRows(), request.getTotalCols(), template); // Gọi hàm mới
        return savedRoom;
    }

    void generateSeatsByTemplate(Rooms room, int rows, int cols, String template) {
        List<Seats> seats = new ArrayList<>();

        for (int r = 1; r <= rows; r++) {
            char rowChar = (char) ('A' + r - 1);

            for (int c = 1; c <= cols; c++) {
                String seatCode = rowChar + String.valueOf(c);
                SeatType type = SeatType.NORMAL;
                boolean isActive = true;

                switch (template) {
                    case "VIP_HALL":
                        if (r > 3)
                            type = SeatType.VIP;
                        break;

                    case "COUPLE_SWEET":
                        if (r > rows - 2) {
                            if (c % 2 != 0 && c < cols) {
                                type = SeatType.COUPLE;
                            } else if (c % 2 == 0) {
                                isActive = false;
                            }
                        } else if (r > rows - 5) {
                            type = SeatType.VIP;
                        }
                        break;

                    default:
                        break;
                }

                Seats seat = Seats.builder()
                        .room(room)
                        .seatCode(seatCode)
                        .rowIndex(r)
                        .colIndex(c)
                        .type(type)
                        .isActive(isActive)
                        .build();
                seats.add(seat);
            }
        }
        seatsRepository.saveAll(seats);
    }

    @Transactional
    public void updateBatch(List<SeatRequest> requests) {
        List<Seats> seatsToUpdate = new ArrayList<>();

        for (SeatRequest req : requests) {
            Seats seat = seatsRepository.findById(req.getId()).orElse(null);

            if (seat != null) {
                seat.setType(req.getType());
                seat.setActive(req.isActive());
                seatsToUpdate.add(seat);
            }
        }
        seatsRepository.saveAll(seatsToUpdate);
    }

    public Rooms updateRoom(Integer id, RoomRequest request) {
        Rooms room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Phòng không tồn tại"));
        room.setName(request.getName());
        return roomRepository.save(room);
    }

    @Transactional
    public void deleteRoom(Integer id) {
        boolean hasShowtimes = showtimesRepository.existsByRoomId(id);

        if (hasShowtimes) {
            throw new RuntimeException("Không thể xóa phòng này vì ĐÃ CÓ LỊCH CHIẾU !");
        }

        seatsRepository.deleteAllByRoomId(id);

        roomRepository.deleteById(id);
    }
}
