package vn.edu.stu.Sanemi.Entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.stu.Sanemi.enums.MoviesStatus;

import java.util.List;

@Entity
@Table(name = "movies")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Movies {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    String title;

    @Column(columnDefinition = "TEXT")
    String description;

    Integer duration;
    String director;

    @Column(name = "trailer_url")
    String trailerUrl;

    @Column(name = "poster_url")
    String posterUrl;

    @Enumerated(EnumType.STRING)
    MoviesStatus status;

    @ManyToMany
    @JoinTable(
            name = "movie_genres",
            joinColumns = @JoinColumn(name = "movie_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    List<Genres> genres;

    @ManyToMany
    @JoinTable(
            name = "movie_actors",
            joinColumns = @JoinColumn(name = "movie_id"),
            inverseJoinColumns = @JoinColumn(name = "actor_id")
    )
    List<Actors> actors;
    @Column(name = "average_rating")
    Double averageRating;
}


