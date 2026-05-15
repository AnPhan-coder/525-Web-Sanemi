package vn.edu.stu.Sanemi.Controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;
import vn.edu.stu.Sanemi.Entity.SnackItems;
import vn.edu.stu.Sanemi.Service.SnackService;
import vn.edu.stu.Sanemi.dto.request.SnackRequest;
import vn.edu.stu.Sanemi.dto.response.ApiResponse;

import java.util.List;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SnackController {

    SnackService snackService;

    // Public: user lấy menu đang bán
    @GetMapping("/api/snacks")
    public ApiResponse<List<SnackItems>> getMenu() {
        return ApiResponse.<List<SnackItems>>builder()
                .result(snackService.getAvailableMenu())
                .build();
    }

    // Admin: lấy toàn bộ (gồm cả item đang ẩn)
    @GetMapping("/api/admin/snacks")
    public ApiResponse<List<SnackItems>> getAllMenu() {
        return ApiResponse.<List<SnackItems>>builder()
                .result(snackService.getAllMenu())
                .build();
    }

    @PostMapping("/api/admin/snacks")
    public ApiResponse<SnackItems> createItem(@RequestBody SnackRequest request) {
        return ApiResponse.<SnackItems>builder()
                .result(snackService.createItem(request))
                .message("Thêm sản phẩm thành công")
                .build();
    }

    @PutMapping("/api/admin/snacks/{id}")
    public ApiResponse<SnackItems> updateItem(@PathVariable Integer id,
                                               @RequestBody SnackRequest request) {
        return ApiResponse.<SnackItems>builder()
                .result(snackService.updateItem(id, request))
                .message("Cập nhật sản phẩm thành công")
                .build();
    }

    // Ẩn/hiện sản phẩm (toggle) — không xóa dữ liệu lịch sử
    @PatchMapping("/api/admin/snacks/{id}/toggle")
    public ApiResponse<String> toggleAvailability(@PathVariable Integer id) {
        snackService.toggleAvailability(id);
        return ApiResponse.<String>builder().message("Đã cập nhật trạng thái").build();
    }

    @DeleteMapping("/api/admin/snacks/{id}")
    public ApiResponse<String> deleteItem(@PathVariable Integer id) {
        snackService.deleteItem(id);
        return ApiResponse.<String>builder().message("Đã xóa sản phẩm").build();
    }
}
