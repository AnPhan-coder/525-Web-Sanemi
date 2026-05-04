package vn.edu.stu.Sanemi.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingsRequest {
    Integer userId;
    Integer showtimeId;
    List<Integer> seatIds;
}


