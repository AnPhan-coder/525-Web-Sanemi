package vn.edu.stu.Sanemi.Controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;
import vn.edu.stu.Sanemi.Service.GeminiService;
import vn.edu.stu.Sanemi.dto.response.ApiResponse;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatController {

    GeminiService geminiService;

    @PostMapping
    public ApiResponse<String> chatWithAI(@RequestBody Map<String, String> request) {
        String userMessage = request.get("message");
        
        // check message
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return ApiResponse.<String>builder()
                    .code(400) // lỗi client
                    .message("Vui lòng nhập tin nhắn")
                    .build();
        }

        // service Gemini
        String aiResponse = geminiService.chatWithGemini(userMessage);

        return ApiResponse.<String>builder()
                .result(aiResponse)
                .message("Phản hồi từ Sanemi AI")
                .build();
    }
}