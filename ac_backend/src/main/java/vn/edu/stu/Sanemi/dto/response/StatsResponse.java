package vn.edu.stu.Sanemi.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Map;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StatsResponse {
    long totalRevenue;
    long totalTickets;
    long totalUsers;
    long newUsers;
    List<Map<String, Object>> revenueByDate;
    List<Map<String, Object>> topMovies;
    List<Map<String, Object>> topMoviesByViewers;
    List<Map<String, Object>> snacksStats;
    List<Map<String, Object>> topSeats;
}

