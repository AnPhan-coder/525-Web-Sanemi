package vn.edu.stu.Sanemi.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.stu.Sanemi.Entity.UserReminders;

import java.util.List;

public interface UserRemindersRepository extends JpaRepository<UserReminders, Integer> {
    List<UserReminders> findByShowtimeId(Integer showtimeId);
}
