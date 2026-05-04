package vn.edu.stu.Sanemi.Scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.stu.Sanemi.Entity.Showtimes;
import vn.edu.stu.Sanemi.Repository.ShowtimesRepository;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ShowtimeScheduler {

    private final ShowtimesRepository showtimesRepository;

    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void cleanupPastShowtimes() {
        LocalDateTime now = LocalDateTime.now();

        List<Showtimes> pastShowtimes = showtimesRepository.findActivePastShowtimes(now);

        if (!pastShowtimes.isEmpty()) {
            log.info("Phát hiện {} suất chiếu đã kết thúc. Đang tiến hành ẩn...", pastShowtimes.size());

            for (Showtimes showtime : pastShowtimes) {
                showtime.setIsActive(false);
            }

            showtimesRepository.saveAll(pastShowtimes);
            log.info("Đã ẩn thành công {} suất chiếu cũ.", pastShowtimes.size());
        }
    }
}


