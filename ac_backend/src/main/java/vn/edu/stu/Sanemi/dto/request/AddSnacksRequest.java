package vn.edu.stu.Sanemi.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddSnacksRequest {
    List<SnackOrderItem> snacks;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class SnackOrderItem {
        Integer snackItemId;
        Integer quantity;
        Double unitPrice;
    }
}
