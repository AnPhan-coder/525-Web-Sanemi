package vn.edu.stu.Sanemi.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import vn.edu.stu.Sanemi.Repository.BookingsRepository;
import vn.edu.stu.Sanemi.Repository.UsersRepository;
import vn.edu.stu.Sanemi.dto.response.StatsResponse;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StatisticsService {

    BookingsRepository bookingRepository;
    UsersRepository usersRepository;

    public StatsResponse getDashboardStats(String filterType, String startDate, String endDate) {
        LocalDateTime start;
        LocalDateTime end = LocalDateTime.now();

        if ("day".equalsIgnoreCase(filterType)) {
            start = LocalDate.now().atStartOfDay();
            end = LocalDate.now().atTime(23, 59, 59);
        } else if ("week".equalsIgnoreCase(filterType)) {
            start = LocalDate.now().minusDays(6).atStartOfDay();
        } else if ("month".equalsIgnoreCase(filterType)) {
            start = LocalDate.now().minusDays(29).atStartOfDay();
        } else if ("custom".equalsIgnoreCase(filterType) && startDate != null && !startDate.trim().isEmpty() && endDate != null && !endDate.trim().isEmpty()) {
            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                start = LocalDate.parse(startDate.trim(), formatter).atStartOfDay();
                end = LocalDate.parse(endDate.trim(), formatter).atTime(23, 59, 59);
            } catch (Exception e) {
                // Fallback to month on parse error
                start = LocalDate.now().minusDays(29).atStartOfDay();
            }
        } else {
            // Default is "all" time
            start = LocalDateTime.of(2000, 1, 1, 0, 0, 0);
        }

        Long revenue = bookingRepository.sumTotalRevenue(start, end);
        Long tickets = bookingRepository.countPaidTickets(start, end);
        long totalUsers = usersRepository.count();
        long newUsers = usersRepository.countByCreatedAtBetween(start, end);

        List<Map<String, Object>> chartData = bookingRepository.getRevenueByDate(start, end);
        List<Map<String, Object>> topMovies = bookingRepository.getTopMoviesByRevenue(start, end);
        List<Map<String, Object>> topMoviesByViewers = bookingRepository.getTopMoviesByViewers(start, end);
        List<Map<String, Object>> snacksStats = bookingRepository.getSnacksStats(start, end);
        List<Map<String, Object>> topSeats = bookingRepository.getMostSelectedSeats(start, end);

        List<Map<String, Object>> limitTop5Movies = topMovies.stream().limit(5).toList();
        List<Map<String, Object>> limitTop5MoviesByViewers = topMoviesByViewers.stream().limit(5).toList();
        List<Map<String, Object>> limitSnacks = snacksStats.stream().limit(10).toList();
        List<Map<String, Object>> limitSeats = topSeats.stream().limit(10).toList();

        return StatsResponse.builder()
                .totalRevenue(revenue != null ? revenue : 0)
                .totalTickets(tickets != null ? tickets : 0)
                .totalUsers(totalUsers)
                .newUsers(newUsers)
                .revenueByDate(chartData)
                .topMovies(limitTop5Movies)
                .topMoviesByViewers(limitTop5MoviesByViewers)
                .snacksStats(limitSnacks)
                .topSeats(limitSeats)
                .build();
    }
}

