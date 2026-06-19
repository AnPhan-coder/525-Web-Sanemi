package vn.edu.stu.Sanemi.dto.response;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.stu.Sanemi.enums.MoviesStatus;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MoviesResponse {
    Integer id;
    String title;
    String description;
    Integer duration;
    String genre;
    String director;
    String trailerUrl;
    String posterUrl;
    String ageRating;
    @Enumerated(EnumType.STRING)
    MoviesStatus status;
}


