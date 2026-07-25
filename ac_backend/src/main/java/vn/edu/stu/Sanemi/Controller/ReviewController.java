package vn.edu.stu.Sanemi.Controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vn.edu.stu.Sanemi.Service.ReviewService;
import vn.edu.stu.Sanemi.dto.request.ReviewReplyRequest;
import vn.edu.stu.Sanemi.dto.request.ReviewRequest;
import vn.edu.stu.Sanemi.dto.response.ApiResponse;
import vn.edu.stu.Sanemi.dto.response.ReviewResponse;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReviewController {

    ReviewService reviewService;

    @PostMapping
    public ApiResponse<ReviewResponse> createOrUpdateReview(@RequestBody ReviewRequest request) {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.<ReviewResponse>builder()
                .result(reviewService.createOrUpdateReview(currentEmail, request))
                .message("Đã lưu đánh giá của bạn")
                .build();
    }

    @GetMapping("/movie/{movieId}")
    public ApiResponse<List<ReviewResponse>> getReviewsByMovie(@PathVariable Integer movieId) {
        return ApiResponse.<List<ReviewResponse>>builder()
                .result(reviewService.getReviewsByMovie(movieId))
                .build();
    }

    @GetMapping("/community")
    public ApiResponse<Page<ReviewResponse>> getCommunityReviews(
            @RequestParam(required = false) Integer movieId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ApiResponse.<Page<ReviewResponse>>builder()
                .result(reviewService.getCommunityReviews(movieId, pageable))
                .build();
    }

    @GetMapping("/my/{movieId}")
    public ApiResponse<ReviewResponse> getMyReview(@PathVariable Integer movieId) {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.<ReviewResponse>builder()
                .result(reviewService.getMyReview(currentEmail, movieId))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> deleteReview(@PathVariable Integer id) {
        reviewService.deleteReview(id);
        return ApiResponse.<String>builder()
                .message("Đã xóa bình luận")
                .build();
    }

    @PostMapping("/reply")
    public ApiResponse<ReviewResponse.ReplyResponse> createReply(@RequestBody ReviewReplyRequest request) {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.<ReviewResponse.ReplyResponse>builder()
                .result(reviewService.createReply(currentEmail, request))
                .message("Đã gửi phản hồi")
                .build();
    }

    @DeleteMapping("/reply/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> deleteReply(@PathVariable Integer id) {
        reviewService.deleteReply(id);
        return ApiResponse.<String>builder()
                .message("Đã xóa phản hồi")
                .build();
    }
}