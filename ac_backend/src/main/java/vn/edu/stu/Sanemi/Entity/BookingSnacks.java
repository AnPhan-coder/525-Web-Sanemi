package vn.edu.stu.Sanemi.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "booking_snacks")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingSnacks {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @ManyToOne
    @JoinColumn(name = "booking_id")
    @JsonIgnore
    Bookings booking;

    @ManyToOne
    @JoinColumn(name = "snack_item_id")
    SnackItems snackItem;

    Integer quantity;

    // Lưu giá tại thời điểm đặt, tránh bị thay đổi khi admin sửa giá sau
    @Column(name = "unit_price")
    Double unitPrice;
}
