package vn.edu.stu.Sanemi.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoomRequest {
    String name;
    Integer totalRows;
    Integer totalCols;
    String templateType;
}


