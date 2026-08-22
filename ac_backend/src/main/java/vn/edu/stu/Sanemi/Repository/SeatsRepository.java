package vn.edu.stu.Sanemi.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import vn.edu.stu.Sanemi.Entity.Seats;

import java.util.List;

@Repository
public interface SeatsRepository extends JpaRepository<Seats, Integer> {
    List<Seats> findByRoomId(Integer roomId);
    void deleteAllByRoomId(Integer roomId);
    int countByRoomIdAndIsActiveTrue(Integer roomId);

    @Query("SELECT s.room.id, COUNT(s) FROM Seats s WHERE s.isActive = true GROUP BY s.room.id")
    List<Object[]> countSeatsGroupedByRoomId();
}


