package vn.edu.stu.Sanemi.Service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.edu.stu.Sanemi.dto.request.ExchangeTokenRequest;
import vn.edu.stu.Sanemi.dto.request.RegisterRequest;
import vn.edu.stu.Sanemi.dto.response.AuthResponse;
import vn.edu.stu.Sanemi.dto.request.LoginRequest;
import vn.edu.stu.Sanemi.Entity.Users;
import vn.edu.stu.Sanemi.Repository.UsersRepository;
import vn.edu.stu.Sanemi.Utils.JwtUtils;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthService {

    @Autowired
    UsersRepository usersRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    EmailService emailService;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    String googleClientId;

    public AuthResponse login(LoginRequest request) {
        Optional<Users> userOpt = usersRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            throw new RuntimeException("Email không tồn tại!");
        }

        Users user = userOpt.get();

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new RuntimeException("Tài khoản của bạn đã bị khóa! Vui lòng liên hệ Admin.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu không đúng!");
        }

        String token = jwtUtils.generateToken(user);
        return new AuthResponse(token, user.getName(), user.getRole(), user.getId());
    }
    public Users register(RegisterRequest request) {
        if (usersRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại!");
        }

        Users newUser = Users.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("customer")
                .createdAt(LocalDateTime.now())
                .build();

        return usersRepository.save(newUser);
    }
    public void forgotPassword(String email){
        Users user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại!"));

        SecureRandom secureRandom = new SecureRandom();
        String otp = String.format("%06d", secureRandom.nextInt(999999));        user.setOtpCode(otp);
        user.setOtpExpiration(LocalDateTime.now().plusMinutes(5));
        usersRepository.save(user);
        emailService.sendEmail(
                email,
                "Mã xác nhận quên mật khẩu - Sanemi",
                "Mã OTP của bạn là: " + otp + "\nMã này sẽ hết hạn sau 5 phút."
        );
    }
    public void resetPassword(String email, String otp, String newPassword) {
        Users user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại!"));

        if (user.getOtpCode() == null || !user.getOtpCode().equals(otp)) {
            throw new RuntimeException("Mã OTP không chính xác!");
        }

        if (user.getOtpExpiration().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã OTP đã hết hạn!");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setOtpCode(null);
        user.setOtpExpiration(null);
        usersRepository.save(user);
    }
    public AuthResponse loginWithGoogle(ExchangeTokenRequest request) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getToken());
            if (idToken == null) {
                throw new RuntimeException("Token Google không hợp lệ!");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");

            Optional<Users> userOpt = usersRepository.findByEmail(email);
            Users user;

            if (userOpt.isPresent()) {
                user = userOpt.get();
            } else {
                user = Users.builder()
                        .email(email)
                        .name(name)
                        .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .role("customer")
                        .createdAt(LocalDateTime.now())
                        .build();
                user = usersRepository.save(user);
            }

            String jwtToken = jwtUtils.generateToken(user);
            return new AuthResponse(jwtToken, user.getName(), user.getRole(), user.getId());

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi xác thực Google: " + e.getMessage());
        }
    }
}

