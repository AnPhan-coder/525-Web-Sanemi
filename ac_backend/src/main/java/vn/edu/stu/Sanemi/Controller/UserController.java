package vn.edu.stu.Sanemi.Controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;
import vn.edu.stu.Sanemi.Entity.Users;
import vn.edu.stu.Sanemi.Service.UserService;
import vn.edu.stu.Sanemi.dto.request.UserUpdateRequest;
import vn.edu.stu.Sanemi.dto.response.ApiResponse;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {
    UserService userService;

    @GetMapping("/{id}")
    public ApiResponse<Users> getUserById(@PathVariable Integer id) {
        return ApiResponse.<Users>builder()
                .result(userService.getUserById(id))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<Users> updateUser(@PathVariable Integer id, @RequestBody UserUpdateRequest request) {
        return ApiResponse.<Users>builder()
                .result(userService.updateUser(id, request))
                .message("Cập nhật thông tin thành công!")
                .build();
    }
}


