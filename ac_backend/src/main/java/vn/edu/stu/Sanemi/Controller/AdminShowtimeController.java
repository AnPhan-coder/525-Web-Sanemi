package vn.edu.stu.Sanemi.Controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.edu.stu.Sanemi.Entity.Showtimes;
import vn.edu.stu.Sanemi.Service.ShowtimeService;
import vn.edu.stu.Sanemi.dto.request.ShowtimeRequest;
import vn.edu.stu.Sanemi.dto.response.ApiResponse;
import vn.edu.stu.Sanemi.dto.response.ShowtimeResponse;

import java.util.List;

@RestController
@RequestMapping("/api/admin/showtimes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminShowtimeController {
    ShowtimeService showtimeService;

    @GetMapping
    public ApiResponse<List<ShowtimeResponse>> getAll() {
        return ApiResponse.<List<ShowtimeResponse>>builder()
                .result(showtimeService.getAllShowtimes())
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> delete(@PathVariable Integer id) {
        showtimeService.deleteShowtime(id);
        return ApiResponse.<String>builder().message("Đã xóa lịch chiếu").build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Showtimes> createShowtime(@RequestBody ShowtimeRequest request) {
        return ApiResponse.<Showtimes>builder()
                .result(showtimeService.createShowtime(request))
                .message("Tạo lịch chiếu thành công!")
                .build();
    }

    @PostMapping("/auto-generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<Showtimes>> autoGenerate(@RequestBody ShowtimeRequest request) {
        return ApiResponse.<List<Showtimes>>builder()
                .result(showtimeService.autoCreateShowtimes(request))
                .message("Xử lý tự động sinh lịch hoàn tất")
                .build();
    }
}


