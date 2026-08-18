package vn.edu.stu.Sanemi.Service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import vn.edu.stu.Sanemi.Entity.Bookings;
import vn.edu.stu.Sanemi.Entity.Genres;
import vn.edu.stu.Sanemi.Entity.Movies;
import vn.edu.stu.Sanemi.Entity.Showtimes;
import vn.edu.stu.Sanemi.Entity.SnackItems;
import vn.edu.stu.Sanemi.Repository.MoviesRepository;
import vn.edu.stu.Sanemi.Repository.ShowtimesRepository;
import vn.edu.stu.Sanemi.Repository.SnackItemRepository;
import vn.edu.stu.Sanemi.dto.request.BookingsRequest;
import vn.edu.stu.Sanemi.dto.response.SeatResponse;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GeminiService {

    @Value("${gemini.api-key}")
    private String apiKey;

    @Value("${gemini.url}")
    private String apiUrl;

    @Autowired
    private MoviesRepository moviesRepository;

    @Autowired
    private ShowtimesRepository showtimesRepository;

    @Autowired
    private SnackItemRepository snackItemRepository;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private VNPayService vnPayService;

    @Autowired
    private HttpServletRequest httpRequest;

    private final RestTemplate restTemplate = new RestTemplate();

    @SuppressWarnings("unchecked")
    public String chatWithGemini(String userMessage, List<Map<String, String>> history, Integer userId) {
        // 1. Lấy toàn bộ danh sách phim từ Local DB
        List<Movies> allMovies = moviesRepository.findAll();
        StringBuilder moviesStr = new StringBuilder();
        if (allMovies.isEmpty()) {
            moviesStr.append("Hiện chưa có phim nào trong cơ sở dữ liệu.\n");
        } else {
            for (Movies m : allMovies) {
                String genreNames = (m.getGenres() != null && !m.getGenres().isEmpty())
                        ? m.getGenres().stream().map(Genres::getName).collect(Collectors.joining(", "))
                        : "Chưa phân loại";
                moviesStr.append(String.format("- **%s** (ID: %d): Thể loại: %s | Thời lượng: %s phút | Trạng thái: %s | Đạo diễn: %s | Đánh giá: %.1f ⭐\n  Mô tả: %s\n",
                        m.getTitle(),
                        m.getId(),
                        genreNames,
                        m.getDuration() != null ? m.getDuration() : "N/A",
                        m.getStatus() != null ? m.getStatus().name() : "N/A",
                        m.getDirector() != null ? m.getDirector() : "N/A",
                        m.getAverageRating() != null ? m.getAverageRating() : 0.0,
                        m.getDescription() != null ? (m.getDescription().length() > 150 ? m.getDescription().substring(0, 150) + "..." : m.getDescription()) : "Không có mô tả"));
            }
        }

        // 2. Lấy lịch chiếu từ Local DB
        List<Showtimes> activeShows = showtimesRepository.findAll().stream()
                .filter(s -> s.getIsActive() != null && s.getIsActive())
                .toList();

        StringBuilder csdlStr = new StringBuilder();
        if (activeShows.isEmpty()) {
            csdlStr.append("Hiện tại chưa có lịch chiếu phim nào.\n");
        } else {
            Map<String, List<Showtimes>> showsByMovie = activeShows.stream()
                    .filter(s -> s.getMovie() != null)
                    .collect(Collectors.groupingBy(s -> s.getMovie().getTitle()));
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm (dd/MM/yyyy)");
            for (Map.Entry<String, List<Showtimes>> entry : showsByMovie.entrySet()) {
                String movieTitle = entry.getKey();
                Integer movieId = entry.getValue().get(0).getMovie().getId();
                String times = entry.getValue().stream()
                        .map(s -> String.format("%s [Phòng: %s, Giá: %,.0f đ, ID: %d]",
                                s.getStartTime() != null ? s.getStartTime().format(formatter) : "N/A",
                                s.getRoom() != null ? s.getRoom().getName() : "N/A",
                                s.getBasePrice() != null ? s.getBasePrice() : 0.0,
                                s.getId()))
                        .collect(Collectors.joining(", "));
                csdlStr.append("- **").append(movieTitle).append("** (Movie ID: ").append(movieId).append("): ").append(times).append("\n");
            }
        }

        // 3. Lấy danh sách bắp nước / combo từ Local DB
        List<SnackItems> snacks = snackItemRepository.findByAvailableTrue();
        StringBuilder snackStr = new StringBuilder();
        if (snacks.isEmpty()) {
            snackStr.append("Hiện chưa có sản phẩm bắp nước nào.\n");
        } else {
            for (SnackItems item : snacks) {
                snackStr.append(String.format("- **%s** (%s): %,.0f VNĐ\n",
                        item.getName(),
                        item.getCategory() != null ? item.getCategory().name() : "SNACK",
                        item.getPrice() != null ? item.getPrice() : 0.0));
            }
        }

        String systemContext = "Bạn là trợ lý ảo nhiệt tình, thông minh của rạp phim Sanemi.\n" +
                "DƯỚI ĐÂY LÀ DỮ LIỆU ĐƯỢC LẤY TRỰC TIẾP TỪ CƠ SỞ DỮ LIỆU LOCAL CỦA RẠP:\n\n" +
                "=== 1. DANH SÁCH PHIM ĐANG CÓ TRONG RẠP ===\n" + moviesStr.toString() + "\n" +
                "=== 2. LỊCH CHIẾU VÀ SUẤT CHIẾU HIỆN CÓ ===\n" + csdlStr.toString() + "\n" +
                "=== 3. MENU BẮP NƯỚC & COMBO ===\n" + snackStr.toString() + "\n\n" +
                "Lưu ý và quy tắc quan trọng:\n" +
                "- Tư vấn hoàn toàn dựa trên dữ liệu thực tế ở trên.\n" +
                "- Khi người dùng hỏi về danh sách phim hoặc yêu cầu gợi ý/đề xuất phim chung chung, hãy giới thiệu các phim và BẮT BUỘC chèn thêm thẻ ẩn [REDIRECT_MOVIES] ở cuối câu trả lời để hệ thống tự động đưa họ tới trang danh sách phim (/movies).\n" +
                "- Khi giới thiệu, trả lời hoặc gợi ý về một bộ phim cụ thể, BẮT BUỘC chèn thêm cú pháp [MOVIE_LINK:id] (với id là Movie ID của bộ phim, ví dụ: [MOVIE_LINK:1]) để hệ thống hiển thị nút xem chi tiết phim cho khách hàng.\n" +
                "- Khi nói về một suất chiếu cụ thể hoặc khi khách hàng muốn đặt vé cho suất chiếu đó, BẮT BUỘC chèn thêm cú pháp [BOOKING_LINK:showtimeId] (với showtimeId là ID của suất chiếu, ví dụ: [BOOKING_LINK:45]) để khách hàng nhấn nút đặt vé nhanh.\n" +
                "- Khi khách hàng hỏi về bắp nước hoặc đồ ăn uống tại rạp, báo đúng các món và giá trong mục Menu Bắp Nước.\n" +
                "- Khi khách hàng muốn hỏi ghế trống, BẮT BUỘC dùng tool check_available_seats với showtimeId tương ứng.\n" +
                "- Khi liệt kê ghế trống, báo rõ tên ghế (code) và giá vé.\n" +
                "- Khi khách hàng yêu cầu đặt vé, BẮT BUỘC dùng tool book_tickets với showtimeId và danh sách seatCodes (mã ghế, ví dụ: C2, C3).\n" +
                "- Nếu khách muốn đặt vé nhưng báo lỗi không có userId, hãy nhắc họ đăng nhập trước khi đặt.\n" +
                "- Không trả lời các câu hỏi bên ngoài rạp phim Sanemi.\n";

        Map<String, Object> tools = buildTools();

        //  Build Contents (lấy ls tn cũ + tn mới)
        List<Map<String, Object>> contents = new ArrayList<>();
        if (history != null) {
            for (Map<String, String> msg : history) {
                contents.add(Map.of("role", msg.get("role"), "parts", List.of(Map.of("text", msg.get("text")))));
            }
        }
        contents.add(Map.of("role", "user", "parts", List.of(Map.of("text", userMessage))));

        //  lần đầu gọi Gemni
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("systemInstruction", Map.of("parts", List.of(Map.of("text", systemContext))));
        requestBody.put("contents", contents);
        requestBody.put("tools", List.of(tools));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            Map<String, Object> response = callApi(requestBody, headers);

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> resParts = (List<Map<String, Object>>) content.get("parts");

            // Ktr có Function Call không 
            if (resParts.size() > 0 && resParts.get(0).containsKey("functionCall")) {
                Map<String, Object> functionCall = (Map<String, Object>) resParts.get(0).get("functionCall");
                String funcName = (String) functionCall.get("name");
                Map<String, Object> args = (Map<String, Object>) functionCall.get("args");

                Object resultData = executeFunction(funcName, args, userId);

                // Thêm phản hồi của function vào ls chat , gọi Gemini lần 2 để lấy phản hồi của khách hàng
                contents.add(content);

                // Add Function Response to contents
                Map<String, Object> functionResponse = new HashMap<>();
                functionResponse.put("name", funcName);
                functionResponse.put("response", Map.of("name", funcName, "content", resultData));
                
                contents.add(Map.of("role", "user", "parts", List.of(Map.of("functionResponse", functionResponse))));

                // Call Gemini Second Time
                requestBody.put("contents", contents);
                Map<String, Object> secondResponse = callApi(requestBody, headers);

                List<Map<String, Object>> secondCandidates = (List<Map<String, Object>>) secondResponse.get("candidates");
                Map<String, Object> secondContent = (Map<String, Object>) secondCandidates.get(0).get("content");
                return (String) ((List<Map<String, Object>>) secondContent.get("parts")).get(0).get("text");
            }

            return (String) resParts.get(0).get("text");

        } catch (Exception e) {
            System.err.println("❌ Lỗi GeminiService: " + e.getMessage());
            e.printStackTrace();
            return "Xin lỗi, hệ thống tư vấn đang gặp sự cố. Bạn vui lòng thử lại sau nhé!";
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> callApi(Map<String, Object> requestBody, HttpHeaders headers) throws Exception {
        String urlWithKey = apiUrl + "?key=" + apiKey;
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
        return restTemplate.postForObject(urlWithKey, requestEntity, Map.class);
    }

    @SuppressWarnings("unchecked")
    private Object executeFunction(String funcName, Map<String, Object> args, Integer userId) {
        try {
            if ("check_available_seats".equals(funcName)) {
                Integer showtimeId = ((Number) args.get("showtimeId")).intValue();
                List<SeatResponse> allSeats = bookingService.getSeatMapByShowtime(showtimeId);
                
                return allSeats.stream()
                        .filter(s -> !s.isBooked())
                        .map(s -> Map.of("id", s.getId(), "code", s.getCode(), "price", s.getPrice()))
                        .collect(Collectors.toList());
            } else if ("book_tickets".equals(funcName)) {
                if (userId == null) {
                    return Map.of("error", "Vui lòng yêu cầu người dùng đăng nhập tài khoản trên website trước khi đặt vé.");
                }

                Integer showtimeId = ((Number) args.get("showtimeId")).intValue();
                
                // Lấy ds tên ghế từ AI
                List<String> seatCodes = (List<String>) args.get("seatCodes");
                List<String> upperSeatCodes = seatCodes.stream().map(String::toUpperCase).toList();

                //  đổi Mã ghế thành ID
                List<SeatResponse> allSeats = bookingService.getSeatMapByShowtime(showtimeId);
                List<Integer> seatIds = allSeats.stream()
                        .filter(s -> upperSeatCodes.contains(s.getCode().toUpperCase()))
                        .map(SeatResponse::getId)
                        .collect(Collectors.toList());

                if (seatIds.isEmpty()) {
                    return Map.of("error", "Không tìm thấy mã ghế, hoặc ghế đã bị đặt mất. Hãy yêu cầu khách chọn ghế khác.");
                }

                BookingsRequest req = new BookingsRequest();
                req.setUserId(userId);
                req.setShowtimeId(showtimeId);
                req.setSeatIds(seatIds); // Nạp ID ghế vào request

                Bookings booking = bookingService.createBooking(req);
                String paymentUrl = vnPayService.createPaymentUrl(booking.getId(), httpRequest);

                return Map.of(
                        "success", true,
                        "bookingId", booking.getId(),
                        "paymentUrl", paymentUrl,
                        "message", "Đặt vé thành công, hãy gửi link thanh toán cho khách hàng bằng Markdown format như sau: [Thanh toán VNPay](" + paymentUrl + ")"
                );
            }
        } catch (Exception e) {
            return Map.of("error", e.getMessage());
        }
        return Map.of("error", "Unknown function");
    }

    private Map<String, Object> buildTools() {
        Map<String, Object> checkSeatsTool = new HashMap<>();
        checkSeatsTool.put("name", "check_available_seats");
        checkSeatsTool.put("description", "Kiểm tra các ghế còn trống của một suất chiếu cụ thể.");
        Map<String, Object> checkParams = new HashMap<>();
        checkParams.put("type", "OBJECT");
        checkParams.put("properties", Map.of(
                "showtimeId", Map.of("type", "INTEGER", "description", "ID của suất chiếu phim")
        ));
        checkParams.put("required", List.of("showtimeId"));
        checkSeatsTool.put("parameters", checkParams);

        Map<String, Object> bookTicketsTool = new HashMap<>();
        bookTicketsTool.put("name", "book_tickets");
        bookTicketsTool.put("description", "Đặt vé và tạo link thanh toán VNPay.");
        Map<String, Object> bookParams = new HashMap<>();
        bookParams.put("type", "OBJECT");
        bookParams.put("properties", Map.of(
                "showtimeId", Map.of("type", "INTEGER", "description", "ID của suất chiếu"),
                "seatCodes", Map.of(
                        "type", "ARRAY",
                        "items", Map.of("type", "STRING"),
                        "description", "Danh sách MÃ GHẾ mà khách chọn (ví dụ: C2, C3)"
                )
        ));
        bookParams.put("required", List.of("showtimeId", "seatCodes"));
        bookTicketsTool.put("parameters", bookParams);

        Map<String, Object> toolDeclarations = new HashMap<>();
        toolDeclarations.put("functionDeclarations", List.of(checkSeatsTool, bookTicketsTool));
        return toolDeclarations;
    }

    @SuppressWarnings("unchecked")
    public String generateVoiceoverScript(String title, String description, String lang) {
        String systemInstruction;
        String userMessage;
        String fallback;
        
        switch (lang.toLowerCase()) {
            case "zh":
                systemInstruction = "You are a professional movie trailer voiceover script writer. Write a dramatic and exciting script in Chinese (Simplified).";
                userMessage = String.format(
                        "Based on movie title '%s' and description '%s', write a short movie trailer narration script of about 60-80 Chinese characters. Focus on excitement. You MUST write the final script in Chinese characters only. Do NOT output any Vietnamese or English words.",
                        title, description != null ? description : ""
                );
                fallback = "欢迎观看电影 " + title + "。这是一部充满魅力与悬疑的杰作，您绝对不容错过。今天就来 Sanemi 影院观赏吧！";
                break;
            case "ja":
                systemInstruction = "You are a professional movie trailer voiceover script writer. Write a dramatic and exciting script in Japanese.";
                userMessage = String.format(
                        "Based on movie title '%s' and description '%s', write a short movie trailer narration script of about 80-100 Japanese characters. Focus on excitement. You MUST write the final script in Japanese characters (Hiragana, Katakana, Kanji) only. Do NOT output any Vietnamese or English words.",
                        title, description != null ? description : ""
                );
                fallback = "映画「" + title + "」へようこそ。Sanemi シアターで見逃せない、スリルと感動に満ちた素晴らしい作品です。今すぐご来場ください！";
                break;
            case "en":
                systemInstruction = "You are a professional movie trailer voiceover script writer. Write a dramatic and exciting script in English.";
                userMessage = String.format(
                        "Based on movie title '%s' and description '%s', write a short movie trailer narration script of about 45-55 words. Focus on excitement. You MUST write the final script in English only. Do NOT output any Vietnamese words.",
                        title, description != null ? description : ""
                );
                fallback = "Welcome to the movie " + title + ". A thrilling and captivating cinematic masterpiece you cannot miss at Sanemi Cinema. Come and watch it today!";
                break;
            default: // vi
                systemInstruction = "Bạn là người viết kịch bản thuyết minh trailer phim chuyên nghiệp, hấp dẫn, kịch tính.";
                userMessage = String.format(
                        "Dựa vào tên phim '%s' và nội dung tóm tắt '%s', hãy viết một đoạn kịch bản thuyết minh trailer ngắn khoảng 45-55 từ để đọc lồng tiếng bằng tiếng Việt, tập trung vào sự hấp dẫn và kịch tính. Chỉ trả về nội dung kịch bản thuyết minh, không chứa tiêu đề, không chứa hướng dẫn âm thanh hay bất kỳ văn bản giải thích nào khác.",
                        title, description != null ? description : ""
                );
                fallback = "Chào mừng bạn đến với bộ phim " + title + ". Một tác phẩm điện ảnh đầy hấp dẫn và lôi cuốn mà bạn không thể bỏ qua tại rạp phim Sanemi. Hãy cùng đón xem ngay hôm nay!";
                break;
        }

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("systemInstruction", Map.of("parts", List.of(Map.of("text", systemInstruction))));
        requestBody.put("contents", List.of(
                Map.of("role", "user", "parts", List.of(Map.of("text", userMessage)))
        ));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            Map<String, Object> response = callApi(requestBody, headers);
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> resParts = (List<Map<String, Object>>) content.get("parts");
            return (String) resParts.get(0).get("text");
        } catch (Exception e) {
            System.err.println("❌ Lỗi generateVoiceoverScript: " + e.getMessage());
            return fallback;
        }
    }
}