package vn.edu.stu.Sanemi.dto.request;


import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.stu.Sanemi.enums.MoviesStatus;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MoviesRequest {

    String title;
    String description;
    Integer duration;
    String director;
    String trailerUrl;
    String posterUrl;
    @Enumerated(EnumType.STRING)
    MoviesStatus status;
    List<Integer> genreIds;
    List<Integer> actorIds;
}


