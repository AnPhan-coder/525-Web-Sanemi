package vn.edu.stu.Sanemi.Entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.stu.Sanemi.enums.SnackCategory;

@Entity
@Table(name = "snack_items")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SnackItems {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    String name;

    Double price;

    @Enumerated(EnumType.STRING)
    SnackCategory category;

    @Column(name = "image_url")
    String imageUrl;

    boolean available;
}
