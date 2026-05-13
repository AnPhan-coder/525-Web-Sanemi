package vn.edu.stu.Sanemi.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.stu.Sanemi.Entity.Movies;
import vn.edu.stu.Sanemi.Entity.Reviews;
import vn.edu.stu.Sanemi.Entity.Users;
import vn.edu.stu.Sanemi.Repository.BookingsRepository;
import vn.edu.stu.Sanemi.Repository.MoviesRepository;
import vn.edu.stu.Sanemi.Repository.ReviewRepository;
import vn.edu.stu.Sanemi.Repository.UsersRepository;
import vn.edu.stu.Sanemi.dto.request.ReviewRequest;
import vn.edu.stu.Sanemi.dto.response.ReviewResponse;
import vn.edu.stu.Sanemi.enums.BookingStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReviewService {
    ReviewRepository reviewRepository;
    UsersRepository usersRepository;
    MoviesRepository moviesRepository;
    BookingsRepository bookingsRepository;

    @Transactional
    public ReviewResponse createOrUpdateReview(String email, ReviewRequest request) {
        Users user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
        Movies movie = moviesRepository.findById(request.getMovieId())
                .orElseThrow(() -> new RuntimeException("Phim không tồn tại"));

        if (request.getRating() != null) {
            boolean hasPaidBooking = bookingsRepository.existsByUserIdAndShowtimeMovieIdAndStatus(
                    user.getId(), movie.getId(), BookingStatus.paid);
            if (!hasPaidBooking) {
                throw new RuntimeException("Bạn cần mua vé xem phim này để có thể đánh giá sao!");
            }
        }

        Reviews review = reviewRepository.findByUserIdAndMovieId(user.getId(), movie.getId())
                .orElse(Reviews.builder()
                        .user(user)
                        .movie(movie)
                        .createdAt(LocalDateTime.now())
                        .build());

        review.setRating(request.getRating());
        review.setContent(request.getContent());
        review.setUpdatedAt(LocalDateTime.now());
        
        Reviews savedReview = reviewRepository.save(review);
        updateMovieAverageRating(movie.getId());

        return mapToResponse(savedReview);
    }

    public List<ReviewResponse> getReviewsByMovie(Integer movieId) {
        return reviewRepository.findByMovieIdOrderByCreatedAtDesc(movieId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public Page<ReviewResponse> getCommunityReviews(Integer movieId, Pageable pageable) {
        return reviewRepository.findCommunityReviews(movieId, pageable)
                .map(this::mapToResponse);
    }

    public ReviewResponse getMyReview(String email, Integer movieId) {
        Users user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không hợp lệ"));
        return reviewRepository.findByUserIdAndMovieId(user.getId(), movieId)
                .map(this::mapToResponse)
                .orElse(null); 
    }

    @Transactional
    public void deleteReview(Integer id) {
        Reviews review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bình luận không tồn tại"));
        Integer movieId = review.getMovie().getId();
        reviewRepository.delete(review);
        updateMovieAverageRating(movieId);
    }

    private void updateMovieAverageRating(Integer movieId) {
        Double avg = reviewRepository.calculateAverageRating(movieId);
        Movies movie = moviesRepository.findById(movieId).orElseThrow();
        movie.setAverageRating(avg != null ? (double) Math.round(avg * 10) / 10 : null);
        moviesRepository.save(movie);
    }

    private ReviewResponse mapToResponse(Reviews review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUser().getId())
                .userName(review.getUser().getName())
                .movieId(review.getMovie().getId())
                .movieTitle(review.getMovie().getTitle())
                .moviePoster(review.getMovie().getPosterUrl())
                .rating(review.getRating())
                .content(review.getContent())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}