package vn.edu.stu.Sanemi.Controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import vn.edu.stu.Sanemi.Entity.Users;
import vn.edu.stu.Sanemi.Service.AuthService;
import vn.edu.stu.Sanemi.dto.request.ExchangeTokenRequest;
import vn.edu.stu.Sanemi.dto.request.LoginRequest;
import vn.edu.stu.Sanemi.dto.request.RegisterRequest;
import vn.edu.stu.Sanemi.dto.request.ResetPasswordRequest;
import vn.edu.stu.Sanemi.dto.response.ApiResponse;
import vn.edu.stu.Sanemi.dto.response.AuthResponse;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // react goi vao
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthController {
    AuthService authService;

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse result = authService.login(request);
        return ApiResponse.<AuthResponse>builder()
                .result(result)
                .build();
    }

    @PostMapping("/register")
    public ApiResponse<Users> register(@RequestBody RegisterRequest request) {
        Users result = authService.register(request);
        return ApiResponse.<Users>builder()
                .result(result)
                .message("Đăng ký thành công!")
                .build();
    }

    @PostMapping("/forgot-password")
    public ApiResponse<String> forgotPassword(@RequestParam String email) {
        authService.forgotPassword(email);
        return ApiResponse.<String>builder()
                .message("Mã OTP đã được gửi đến email của bạn!")
                .build();
    }

    @PostMapping("/reset-password")
    public ApiResponse<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
        return ApiResponse.<String>builder()
                .message("Đặt lại mật khẩu thành công!")
                .build();
    }

    @PostMapping("/google")
    public ApiResponse<AuthResponse> loginGoogle(@RequestBody ExchangeTokenRequest request) {
        AuthResponse result = authService.loginWithGoogle(request);
        return ApiResponse.<AuthResponse>builder()
                .result(result)
                .build();
    }
}
