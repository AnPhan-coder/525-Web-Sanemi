package vn.edu.stu.Sanemi.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.stu.Sanemi.Entity.BookingSnacks;

import java.util.List;

@Repository
public interface BookingSnacksRepository extends JpaRepository<BookingSnacks, Integer> {
    List<BookingSnacks> findByBookingId(Integer bookingId);
}
