package vn.edu.stu.Sanemi.Controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vn.edu.stu.Sanemi.Entity.Users;
import vn.edu.stu.Sanemi.Repository.UsersRepository;
import vn.edu.stu.Sanemi.Service.GeminiService;
import vn.edu.stu.Sanemi.dto.response.ApiResponse;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatController {

    GeminiService geminiService;
    UsersRepository usersRepository;

    @PostMapping
    public ApiResponse<String> chatWithAI(@RequestBody Map<String, Object> request) {
        String userMessage = (String) request.get("message");
        List<Map<String, String>> history = (List<Map<String, String>>) request.get("history");

        // check message
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return ApiResponse.<String>builder()
                    .code(400) // lỗi client
                    .message("Vui lòng nhập tin nhắn")
                    .build();
        }

        // get current user
        String email = null;
        Integer userId = null;
        try {
            if (SecurityContextHolder.getContext().getAuthentication() != null &&
                    SecurityContextHolder.getContext().getAuthentication().isAuthenticated() &&
                    !"anonymousUser".equals(SecurityContextHolder.getContext().getAuthentication().getName())) {
                email = SecurityContextHolder.getContext().getAuthentication().getName();
                Optional<Users> optUser = usersRepository.findByEmail(email);
                if (optUser.isPresent()) {
                    userId = optUser.get().getId();
                }
            }
        } catch (Exception e) {
            // ignore
        }

        // service Gemini
        String aiResponse = geminiService.chatWithGemini(userMessage, history, userId);

        return ApiResponse.<String>builder()
                .result(aiResponse)
                .message("Phản hồi từ Sanemi AI")
                .build();
    }
}