package vn.edu.stu.Sanemi.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.stu.Sanemi.Entity.Reviews;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Reviews, Integer> {
    
    // Tìm review của 1 user cho 1 phim (dùng để check lúc upsert)
    Optional<Reviews> findByUserIdAndMovieId(Integer userId, Integer movieId);

    // Lấy toàn bộ bình luận của 1 phim (chi tiết phim)
    List<Reviews> findByMovieIdOrderByCreatedAtDesc(Integer movieId);

    // Dành cho trang cộng đồng (có hỗ trợ filter theo movieId và phân trang)
    @Query("SELECT r FROM Reviews r WHERE (:movieId IS NULL OR r.movie.id = :movieId) ORDER BY r.createdAt DESC")
    Page<Reviews> findCommunityReviews(@Param("movieId") Integer movieId, Pageable pageable);

    // Query tính lại điểm trung bình của phim sau khi có người rate mới
    @Query("SELECT AVG(r.rating) FROM Reviews r WHERE r.movie.id = :movieId AND r.rating IS NOT NULL")
    Double calculateAverageRating(@Param("movieId") Integer movieId);
}