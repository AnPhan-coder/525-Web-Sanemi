package vn.edu.stu.Sanemi.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.stu.Sanemi.enums.SeatType;

@Entity
@Table(name = "seats")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Seats {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "seat_code")
    String seatCode;
    int rowIndex;
    int colIndex;

    @Enumerated(EnumType.STRING)
    SeatType type;
    @Column(columnDefinition = "boolean default true")
    boolean isActive;
    @ManyToOne
    @JoinColumn(name = "room_id")
    @JsonIgnore
    Rooms room;
}


