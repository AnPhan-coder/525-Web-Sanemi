package vn.edu.stu.Sanemi.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "booking_details")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @ManyToOne
    @JoinColumn(name = "booking_id")
    @JsonIgnore
    Bookings booking;

    @ManyToOne
    @JoinColumn(name = "seat_id")
    Seats seat;

    Double price;

    @Column(name = "qr_code")
    String qrCode;

    
}


