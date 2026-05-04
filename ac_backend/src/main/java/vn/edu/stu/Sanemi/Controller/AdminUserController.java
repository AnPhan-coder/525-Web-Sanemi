package vn.edu.stu.Sanemi.Controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.edu.stu.Sanemi.Entity.Bookings;
import vn.edu.stu.Sanemi.Entity.Users;
import vn.edu.stu.Sanemi.Service.UserService;
import vn.edu.stu.Sanemi.dto.response.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminUserController {
    UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<Users>> getAllUsers() {
        return ApiResponse.<List<Users>>builder()
                .result(userService.getAllUsers())
                .build();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> toggleUserStatus(@PathVariable Integer id) {
        String message = userService.toggleUserStatus(id);

        return ApiResponse.<String>builder()
                .message(message)
                .build();
    }
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Users> changeUserRole(@PathVariable Integer id, @RequestParam String role) {
        Users updatedUser = userService.updateUserRole(id, role);
        return ApiResponse.<Users>builder()
                .result(updatedUser)
                .message("Cập nhật vai trò thành công!")
                .build();
    }

    @GetMapping("/{id}/bookings")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<Bookings>> getUserBookings(@PathVariable Integer id) {
        return ApiResponse.<List<Bookings>>builder()
                .result(userService.getUserBookings(id))
                .build();
    }
}


