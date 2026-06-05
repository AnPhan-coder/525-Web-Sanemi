package vn.edu.stu.Sanemi.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import vn.edu.stu.Sanemi.Entity.Showtimes; // Đảm bảo import đúng Entity của bạn
import vn.edu.stu.Sanemi.Repository.ShowtimesRepository; // Import Repository

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GeminiService {

    @Value("${gemini.api-key}")
    private String apiKey;

    @Value("${gemini.url}")
    private String apiUrl;

    // 1. Tiêm ShowtimesRepository thay vì MoviesRepository
    @Autowired
    private ShowtimesRepository showtimesRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    public String chatWithGemini(String userMessage) {
        
        // 2. Kéo toàn bộ lịch chiếu TƯƠNG LAI từ Database
        List<Showtimes> upcomingShows = showtimesRepository.findAll().stream()
                .filter(s -> s.getIsActive() != null && s.getIsActive())
                .filter(s -> s.getStartTime() != null && s.getStartTime().isAfter(LocalDateTime.now()))
                .toList();

        // 3. Xử lý gom nhóm: Phim A -> [10:00, 14:00], Phim B -> [18:00]
        StringBuilder csdlStr = new StringBuilder();
        if (upcomingShows.isEmpty()) {
            csdlStr.append("Hiện tại chưa có lịch chiếu phim nào trong thời gian tới.");
        } else {
            // Gom nhóm theo tên phim
            Map<String, List<Showtimes>> showsByMovie = upcomingShows.stream()
                    .collect(Collectors.groupingBy(s -> s.getMovie().getTitle()));

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm (dd/MM)");

            for (Map.Entry<String, List<Showtimes>> entry : showsByMovie.entrySet()) {
                String movieTitle = entry.getKey();
                String times = entry.getValue().stream()
                        .map(s -> s.getStartTime().format(formatter))
                        .collect(Collectors.joining(", "));
                csdlStr.append("- **").append(movieTitle).append("**: ").append(times).append("\n");
            }
        }

        // 4. Bơm ngữ cảnh cực mạnh cho AI
        String systemContext = "Bạn là trợ lý ảo nhiệt tình của rạp phim Sanemi. " +
                "Dưới đây là DỮ LIỆU LỊCH CHIẾU THỰC TẾ của rạp:\n" +
                csdlStr.toString() + "\n" +
                "Yêu cầu:\n" +
                "- Chỉ tư vấn phim và giờ chiếu dựa trên danh sách trên. Không tự bịa phim.\n" +
                "- Nếu khách hỏi phim không có trong danh sách, hãy báo là phim đã ngừng chiếu hoặc chưa có lịch.\n" +
                "- Sử dụng format Markdown và in đậm tên phim.\n\n" +
                "Khách hỏi: ";

        String finalPrompt = systemContext + userMessage;

        // ... [Giữ nguyên phần gọi API Google bên dưới] ...
        Map<String, Object> parts = new HashMap<>();
        parts.put("text", finalPrompt);

        Map<String, Object> contents = new HashMap<>();
        contents.put("parts", List.of(parts));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(contents));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            String urlWithKey = apiUrl + "?key=" + apiKey;
            Map<String, Object> response = restTemplate.postForObject(urlWithKey, requestEntity, Map.class);

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> resParts = (List<Map<String, Object>>) content.get("parts");

            return (String) resParts.get(0).get("text");

        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            System.err.println("❌ Lỗi từ Google Gemini (Mã " + e.getStatusCode() + "):");
            System.err.println(e.getResponseBodyAsString());
            return "Xin lỗi, hệ thống tư vấn đang quá tải. Bạn vui lòng liên hệ hotline nhé!";
        } catch (Exception e) {
            System.err.println("❌ Lỗi kết nối mạng: " + e.getMessage());
            return "Xin lỗi, hệ thống tư vấn đang quá tải. Bạn vui lòng liên hệ hotline nhé!";
        }
    }
}