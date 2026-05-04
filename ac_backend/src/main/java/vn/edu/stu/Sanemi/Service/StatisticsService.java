package vn.edu.stu.Sanemi.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import vn.edu.stu.Sanemi.Repository.BookingsRepository;
import vn.edu.stu.Sanemi.Repository.UsersRepository;
import vn.edu.stu.Sanemi.dto.response.StatsResponse;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StatisticsService {

    BookingsRepository bookingRepository;
    UsersRepository usersRepository;

    public StatsResponse getDashboardStats() {
        Long revenue = bookingRepository.sumTotalRevenue();
        Long tickets = bookingRepository.countPaidBookings();
        long users = usersRepository.count();

        List<Map<String, Object>> chartData = bookingRepository.getRevenueByDate();
        List<Map<String, Object>> topMovies = bookingRepository.getTopMovies();

        List<Map<String, Object>> limitTop5Movies = topMovies.stream().limit(5).toList();

        return StatsResponse.builder()
                .totalRevenue(revenue != null ? revenue : 0)
                .totalTickets(tickets != null ? tickets : 0)
                .totalUsers(users)
                .revenueByDate(chartData)
                .topMovies(limitTop5Movies)
                .build();
    }
}

