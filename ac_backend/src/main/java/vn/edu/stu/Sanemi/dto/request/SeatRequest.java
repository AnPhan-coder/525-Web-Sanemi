package vn.edu.stu.Sanemi.dto.request;


import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.stu.Sanemi.enums.MoviesStatus;
import vn.edu.stu.Sanemi.enums.SeatType;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SeatRequest {

    Integer id;
    SeatType type;
    boolean isActive;
}


