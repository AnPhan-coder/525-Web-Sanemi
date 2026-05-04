package vn.edu.stu.Sanemi.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import vn.edu.stu.Sanemi.Entity.Movies;
import vn.edu.stu.Sanemi.Entity.Rooms;

import java.time.LocalDateTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShowtimeResponse {
    Integer id;
    LocalDateTime startTime;
    LocalDateTime endTime;
    Double basePrice;
    boolean isActive;

    Movies movie;
    Rooms room;

    int notBooked;
    int totalSeats;
}


