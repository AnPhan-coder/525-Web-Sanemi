package vn.edu.stu.Sanemi.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.stu.Sanemi.Entity.ReviewReplies;

import java.util.List;

@Repository
public interface ReviewRepliesRepository extends JpaRepository<ReviewReplies, Integer> {
    List<ReviewReplies> findByReviewIdOrderByCreatedAtAsc(Integer reviewId);
    List<ReviewReplies> findByReviewIdInOrderByCreatedAtAsc(List<Integer> reviewIds);
}
