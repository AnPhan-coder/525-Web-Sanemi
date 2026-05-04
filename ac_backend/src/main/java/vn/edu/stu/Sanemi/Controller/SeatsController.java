package vn.edu.stu.Sanemi.Controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;
import vn.edu.stu.Sanemi.Entity.Seats;
import vn.edu.stu.Sanemi.Repository.SeatsRepository;
import vn.edu.stu.Sanemi.Service.RoomService;
import vn.edu.stu.Sanemi.dto.request.SeatRequest;
import vn.edu.stu.Sanemi.dto.response.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // react goi vao
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SeatsController {
    SeatsRepository seatsRepository;
    RoomService roomService;
    @GetMapping
    public ApiResponse<List<Seats>> getSeatsByRoom(@RequestParam Integer roomId) {
        return ApiResponse.<List<Seats>>builder()
                .result(seatsRepository.findByRoomId(roomId))
                .build();
    }
    @PostMapping("/batch-update")
    public ApiResponse<String> updateBatchSeats(@RequestBody List<SeatRequest> requests) {
        roomService.updateBatch(requests);
        return ApiResponse.<String>builder().message("Đã lưu sơ đồ ghế!").build();
    }
    @PutMapping("/{id}")
    public ApiResponse<Seats> updateSeat(@PathVariable Integer id, @RequestBody Seats request) {
        Seats seat = seatsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ghế không tồn tại"));

        seat.setType(request.getType());

        return ApiResponse.<Seats>builder()
                .result(seatsRepository.save(seat))
                .message("Cập nhật ghế thành công")
                .build();
    }
    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteSeat(@PathVariable Integer id){
        seatsRepository.deleteById(id);
        return ApiResponse.<String>builder()
                .message("Đã xóa ghế")
                .build();
    }
}


