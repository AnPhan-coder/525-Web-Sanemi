package vn.edu.stu.Sanemi.Repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.stu.Sanemi.Entity.Movies;
import vn.edu.stu.Sanemi.Entity.Rooms;
import vn.edu.stu.Sanemi.Entity.Seats;
import vn.edu.stu.Sanemi.enums.MoviesStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface MoviesRepository extends JpaRepository<Movies, String> {
    boolean existsByTitle(String title);
    Optional<Movies> findById(Integer movieId);

    Optional<Movies> findByTitle(String title);
    @Query("SELECT DISTINCT m FROM Movies m " +
            "LEFT JOIN m.genres g " +
            "WHERE (:keyword IS NULL OR m.title LIKE %:keyword%) " +
            "AND (:status IS NULL OR m.status = :status) " +
            "AND (:genreId IS NULL OR g.id = :genreId)")
    List<Movies> searchMovies(
            @Param("keyword") String keyword,
            @Param("status") MoviesStatus status,
            @Param("genreId") Integer genreId
    );
    @Query("SELECT m FROM Movies m WHERE m.status = 'active' " +
            "AND (SELECT COUNT(s) FROM Showtimes s WHERE s.movie.id = m.id AND s.startTime > CURRENT_TIMESTAMP) = 0")
    List<Movies> findExpiredMovies();
}


