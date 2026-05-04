package vn.edu.stu.Sanemi.dto.response;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import vn.edu.stu.Sanemi.enums.SeatType;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SeatResponse {
    Integer id;
    String code;
    @Enumerated(EnumType.STRING)
    SeatType type;
    Double price;
    int rowIndex;
    int colIndex;
    boolean isBooked;
}

