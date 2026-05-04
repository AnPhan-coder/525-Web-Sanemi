package vn.edu.stu.Sanemi.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.stu.Sanemi.Entity.Bookings;
import vn.edu.stu.Sanemi.enums.BookingStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface BookingsRepository extends JpaRepository<Bookings, Integer> {
    List<Bookings> findByUserIdOrderByBookingTimeDesc(Integer userId);
    @Query("SELECT b FROM Bookings b WHERE b.status = :status AND b.bookingTime < :time")
    List<Bookings> findExpiredBookings(@Param("time") LocalDateTime time, @Param("status") BookingStatus status);

    List<Bookings> findByUserId(Integer userId);

    @Query("SELECT SUM(b.totalPrice) FROM Bookings b WHERE b.status = 'paid'")
    Long sumTotalRevenue();

    @Query("SELECT COUNT(b) FROM Bookings b WHERE b.status = 'paid'")
    Long countPaidBookings();

    @Query(value = "SELECT DATE(b.booking_time) as date, SUM(b.total_price) as revenue " +
            "FROM bookings b WHERE b.status = 'paid' " +
            "GROUP BY DATE(b.booking_time) " +
            "ORDER BY date DESC LIMIT 7", nativeQuery = true)
    List<Map<String, Object>> getRevenueByDate();

    @Query("SELECT b.showtime.movie.title as movie, SUM(b.totalPrice) as revenue " +
            "FROM Bookings b WHERE b.status = 'paid' " +
            "GROUP BY b.showtime.movie.title " +
            "ORDER BY revenue DESC")
    List<Map<String, Object>> getTopMovies();
}


