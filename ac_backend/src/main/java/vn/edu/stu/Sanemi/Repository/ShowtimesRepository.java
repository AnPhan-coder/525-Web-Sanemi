package vn.edu.stu.Sanemi.Repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.stu.Sanemi.Entity.Showtimes;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShowtimesRepository extends JpaRepository<Showtimes,Integer> {
    List<Showtimes> findAllByOrderByStartTimeDesc();
    Long countByMovieIdAndStartTimeAfter(Integer movieId, LocalDateTime startTime);
    boolean existsByMovieIdAndEndTimeBefore(Integer movieId, LocalDateTime time);

    @Query("SELECT COUNT(s) > 0 FROM Showtimes s WHERE s.room.id = :roomId " +
            "AND (:startTime < s.endTime AND :endTime > s.startTime)")
    boolean existsByRoomIdAndTimeOverlap(Integer roomId, LocalDateTime startTime, LocalDateTime endTime);

    List<Showtimes> findByMovieId(Integer movieId);

    boolean existsByRoomId(Integer roomId);

    @Query("SELECT s FROM Showtimes s WHERE s.room.id = :roomId " +
            "AND s.startTime < :endTime AND s.endTime > :startTime")
    List<Showtimes> checkOverlap(@Param("roomId") Integer roomId,
                                 @Param("startTime") LocalDateTime startTime,
                                 @Param("endTime") LocalDateTime endTime);

    @Query("SELECT s FROM Showtimes s WHERE s.isActive = true AND s.endTime < :now")
    List<Showtimes> findActivePastShowtimes(@Param("now") LocalDateTime now);
}


