package vn.edu.stu.Sanemi.dto.request;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    String email;
    String otp;
    String newPassword;
}

