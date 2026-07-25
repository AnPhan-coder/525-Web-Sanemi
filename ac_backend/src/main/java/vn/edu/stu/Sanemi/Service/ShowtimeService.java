package vn.edu.stu.Sanemi.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.stu.Sanemi.Entity.Movies;
import vn.edu.stu.Sanemi.Entity.Rooms;
import vn.edu.stu.Sanemi.Entity.Showtimes;
import vn.edu.stu.Sanemi.Repository.*;
import vn.edu.stu.Sanemi.dto.request.ShowtimeRequest;
import vn.edu.stu.Sanemi.dto.response.ShowtimeResponse;
import vn.edu.stu.Sanemi.enums.MoviesStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ShowtimeService {
    ShowtimesRepository showtimesRepository;
    MoviesRepository moviesRepository;
    RoomRepository roomRepository;
    BookingDetailsRepository bookingDetailsRepository;
    SeatsRepository seatsRepository;

    int CLEANING_TIME = 15;

    public List<ShowtimeResponse> getAllShowtimes() {
        List<Showtimes> list = showtimesRepository.findAllByOrderByStartTimeDesc();

        Map<Integer, Long> bookedMap = bookingDetailsRepository.countBookedSeatsGroupedByShowtimeId().stream()
                .collect(Collectors.toMap(
                        arr -> ((Number) arr[0]).intValue(),
                        arr -> ((Number) arr[1]).longValue(),
                        (v1, v2) -> v1
                ));

        Map<Integer, Long> roomSeatsMap = seatsRepository.countSeatsGroupedByRoomId().stream()
                .collect(Collectors.toMap(
                        arr -> ((Number) arr[0]).intValue(),
                        arr -> ((Number) arr[1]).longValue(),
                        (v1, v2) -> v1
                ));

        return list.stream().map(showtime -> {
            int booked = bookedMap.getOrDefault(showtime.getId(), 0L).intValue();
            int total = roomSeatsMap.getOrDefault(showtime.getRoom().getId(), 0L).intValue();
            int notBooked = total - booked;

            return ShowtimeResponse.builder()
                    .id(showtime.getId())
                    .startTime(showtime.getStartTime())
                    .endTime(showtime.getEndTime())
                    .basePrice(showtime.getBasePrice())
                    .isActive(showtime.getIsActive())
                    .movie(showtime.getMovie())
                    .room(showtime.getRoom())
                    .notBooked(notBooked)
                    .totalSeats(total)
                    .build();
        }).collect(Collectors.toList());
    }
    @Transactional
    public Showtimes createShowtime(ShowtimeRequest request) {
        Movies movie = moviesRepository.findById(request.getMovieId())
                .orElseThrow(() -> new RuntimeException("Phim không tồn tại"));
        Rooms room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Phòng không tồn tại"));

        LocalDateTime start = request.getStartTime();
        LocalDateTime end = start.plusMinutes(movie.getDuration() + CLEANING_TIME);

        List<Showtimes> overlaps = showtimesRepository.checkOverlap(request.getRoomId(), start, end);
        if (!overlaps.isEmpty()) {
            throw new RuntimeException("Phòng này đang bận trong khung giờ đã chọn!");
        }
        Double basePrice = request.getBasePrice();

        checkAndUpdateMovieStatus(movie);

        Showtimes showtime = Showtimes.builder()
                .movie(movie)
                .room(room)
                .startTime(start)
                .endTime(end)
                .basePrice(basePrice)
                .isActive(true)
                .build();

        return showtimesRepository.save(showtime);
    }

    @Transactional
    public void deleteShowtime(Integer id) {
        Showtimes showtime = showtimesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lịch không tồn tại"));

        Integer movieId = showtime.getMovie().getId();

        showtimesRepository.deleteById(id);

        checkAndResetMovieStatus(movieId);
    }

    void checkAndResetMovieStatus(Integer movieId) {
        Movies movie = moviesRepository.findById(movieId).orElse(null);
        if (movie != null && "active".equalsIgnoreCase(String.valueOf(movie.getStatus()))) {

            long futureShowtimes = showtimesRepository.countByMovieIdAndStartTimeAfter(movieId, LocalDateTime.now());

            if (futureShowtimes == 0) {
                movie.setStatus(MoviesStatus.valueOf("finished"));
                moviesRepository.save(movie);
            }
        }
    }

    @Transactional
    public List<Showtimes> autoCreateShowtimes(ShowtimeRequest request) {
        Movies movie = moviesRepository.findById(request.getMovieId())
                .orElseThrow(() -> new RuntimeException("Phim không tồn tại"));
        Rooms room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Phòng không tồn tại"));

        LocalDateTime currentStart = request.getStartTime();
        LocalDateTime closingTime = currentStart.toLocalDate().atTime(23, 0);

        List<Showtimes> createdShowtimes = new ArrayList<>();
        int count = 0;

        while (currentStart.plusMinutes(movie.getDuration()).isBefore(closingTime)) {

            LocalDateTime currentEnd = currentStart.plusMinutes(movie.getDuration() + 15);

            List<Showtimes> overlaps = showtimesRepository.checkOverlap(request.getRoomId(), currentStart, currentEnd);

            if (overlaps.isEmpty()) {
                Showtimes showtime = Showtimes.builder()
                        .movie(movie)
                        .room(room)
                        .startTime(currentStart)
                        .endTime(currentEnd)
                        .basePrice(request.getBasePrice())
                        .isActive(true)
                        .build();

                Showtimes saved = showtimesRepository.save(showtime);
                createdShowtimes.add(saved);
                count++;
            }

            currentStart = currentEnd;
        }

        if (count > 0) {
            checkAndUpdateMovieStatus(movie);
        }

        return createdShowtimes;
    }

    void checkAndUpdateMovieStatus(Movies movie) {
        if ("upcoming".equalsIgnoreCase(String.valueOf(movie.getStatus())) || "finished".equalsIgnoreCase(String.valueOf(movie.getStatus()))) {
            movie.setStatus(MoviesStatus.valueOf("active"));
            moviesRepository.save(movie);
        }
    }
}


