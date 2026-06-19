package vn.edu.stu.Sanemi.Entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "movie_trailers")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MovieTrailers {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @ManyToOne
    @JoinColumn(name = "movie_id")
    Movies movie;

    @Column(name = "trailer_url")
    String trailerUrl;

    @Column(name = "language_type")
    String languageType; // SUBTITLE or DUBBED

    @Column(name = "language_name")
    String languageName; // e.g. Tiếng Việt, Tiếng Anh
}
