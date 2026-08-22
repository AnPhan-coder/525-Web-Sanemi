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

    @Query("SELECT SUM(b.totalPrice) FROM Bookings b WHERE b.status = 'paid' AND b.bookingTime >= :start AND b.bookingTime <= :end")
    Long sumTotalRevenue(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(bd) FROM BookingDetails bd WHERE bd.booking.status = 'paid' AND bd.booking.bookingTime >= :start AND bd.booking.bookingTime <= :end")
    Long countPaidTickets(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query(value = "SELECT DATE(b.booking_time) as date, SUM(b.total_price) as revenue " +
            "FROM bookings b WHERE b.status = 'paid' AND b.booking_time >= :start AND b.booking_time <= :end " +
            "GROUP BY DATE(b.booking_time) " +
            "ORDER BY date ASC", nativeQuery = true)
    List<Map<String, Object>> getRevenueByDate(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT b.showtime.movie.title as movie, SUM(b.totalPrice) as revenue " +
            "FROM Bookings b WHERE b.status = 'paid' AND b.bookingTime >= :start AND b.bookingTime <= :end " +
            "GROUP BY b.showtime.movie.title " +
            "ORDER BY revenue DESC")
    List<Map<String, Object>> getTopMoviesByRevenue(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT bd.booking.showtime.movie.title as movie, COUNT(bd.id) as viewers " +
            "FROM BookingDetails bd WHERE bd.booking.status = 'paid' AND bd.booking.bookingTime >= :start AND bd.booking.bookingTime <= :end " +
            "GROUP BY bd.booking.showtime.movie.title " +
            "ORDER BY viewers DESC")
    List<Map<String, Object>> getTopMoviesByViewers(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT bs.snackItem.name as name, SUM(bs.quantity) as quantity, SUM(bs.quantity * bs.unitPrice) as revenue " +
            "FROM BookingSnacks bs WHERE bs.booking.status = 'paid' AND bs.booking.bookingTime >= :start AND bs.booking.bookingTime <= :end " +
            "GROUP BY bs.snackItem.name " +
            "ORDER BY quantity DESC")
    List<Map<String, Object>> getSnacksStats(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT bd.seat.seatCode as seatCode, COUNT(bd.id) as count " +
            "FROM BookingDetails bd WHERE bd.booking.status = 'paid' AND bd.booking.bookingTime >= :start AND bd.booking.bookingTime <= :end " +
            "GROUP BY bd.seat.seatCode " +
            "ORDER BY count DESC")
    List<Map<String, Object>> getMostSelectedSeats(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    boolean existsByUserIdAndShowtimeMovieIdAndStatus(Integer userId, Integer movieId, BookingStatus status);

    boolean existsByUserIdAndShowtimeMovieIdAndStatusAndShowtimeEndTimeBefore(Integer userId, Integer movieId, BookingStatus status, LocalDateTime time);
}


