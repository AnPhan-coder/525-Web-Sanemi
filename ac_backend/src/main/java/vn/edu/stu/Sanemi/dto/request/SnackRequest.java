package vn.edu.stu.Sanemi.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.stu.Sanemi.enums.SnackCategory;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SnackRequest {
    String name;
    Double price;
    SnackCategory category;
    String imageUrl;
    boolean available;
}
