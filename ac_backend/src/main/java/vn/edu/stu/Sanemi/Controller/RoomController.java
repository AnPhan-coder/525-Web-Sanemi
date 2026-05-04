package vn.edu.stu.Sanemi.Controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;
import vn.edu.stu.Sanemi.Entity.Rooms;
import vn.edu.stu.Sanemi.Repository.RoomRepository;
import vn.edu.stu.Sanemi.Service.RoomService;
import vn.edu.stu.Sanemi.dto.request.RoomRequest;
import vn.edu.stu.Sanemi.dto.response.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // react goi vao
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoomController {
    RoomRepository roomRepository;
    RoomService roomService;
    @GetMapping
    public ApiResponse<List<Rooms>> getAllRooms() {
        return ApiResponse.<List<Rooms>>builder()
                .result(roomRepository.findAll())
                .build();
    }
    @PostMapping
    public ApiResponse<Rooms> createRoom(@RequestBody RoomRequest request) {
        return ApiResponse.<Rooms>builder()
                .result(roomService.createRoom(request))
                .message("Tạo phòng và sinh sơ đồ ghế thành công!")
                .build();
    }
    @PutMapping("/{id}")
    public ApiResponse<Rooms> updateRoom(@PathVariable Integer id, @RequestBody RoomRequest request) {
        return ApiResponse.<Rooms>builder()
                .result(roomService.updateRoom(id, request))
                .message("Cập nhật phòng thành công")
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteRoom(@PathVariable Integer id) {
        roomService.deleteRoom(id);
        return ApiResponse.<String>builder().message("Đã xóa phòng").build();
    }
}


