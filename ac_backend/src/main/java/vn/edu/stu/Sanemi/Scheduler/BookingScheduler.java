package vn.edu.stu.Sanemi.Scheduler;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.stu.Sanemi.Entity.Bookings;
import vn.edu.stu.Sanemi.Repository.BookingsRepository;
import vn.edu.stu.Sanemi.enums.BookingStatus;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookingScheduler {
    BookingsRepository bookingsRepository;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void autoCancelExperiedBooking(){
        LocalDateTime expiration = LocalDateTime.now().minusMinutes(10);

        List<Bookings> expiredBookings = bookingsRepository.findExpiredBookings(expiration, BookingStatus.pending);
        if (!expiredBookings.isEmpty()) {
            log.info("Phát hiện {} đơn hàng quá hạn. Đang tiến hành hủy...", expiredBookings.size());

            for (Bookings booking : expiredBookings) {
                booking.setStatus(BookingStatus.cancelled);
            }

            bookingsRepository.saveAll(expiredBookings);
            log.info("Đã giải phóng ghế cho {} đơn hàng.", expiredBookings.size());
        }
    }
}


