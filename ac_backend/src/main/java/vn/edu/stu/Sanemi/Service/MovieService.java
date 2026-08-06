package vn.edu.stu.Sanemi.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import vn.edu.stu.Sanemi.Entity.Actors;
import vn.edu.stu.Sanemi.Entity.Genres;
import vn.edu.stu.Sanemi.Entity.Movies;
import vn.edu.stu.Sanemi.Repository.ActorsRepository;
import vn.edu.stu.Sanemi.Repository.GenresRepository;
import vn.edu.stu.Sanemi.Repository.MoviesRepository;
import vn.edu.stu.Sanemi.dto.request.MoviesRequest;
import vn.edu.stu.Sanemi.enums.MoviesStatus;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MovieService {
    MoviesRepository moviesRepository;
    GenresRepository genresRepository;
    ActorsRepository actorsRepository;

    public Movies createMovie(MoviesRequest request) {
        List<Genres> genres = genresRepository.findAllById(request.getGenreIds());
        List<Actors> actors = actorsRepository.findAllById(request.getActorIds());

        Movies movie = Movies.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .duration(request.getDuration())
                .director(request.getDirector())
                .trailerUrl(request.getTrailerUrl())
                .posterUrl(request.getPosterUrl())
                .ageRating(request.getAgeRating())
                .status(request.getStatus())
                .genres(genres)
                .actors(actors)
                .build();

        return moviesRepository.save(movie);
    }

    public Movies updateMovie(Integer id, MoviesRequest request) {
        Movies exMovie = moviesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Phim không tồn tại"));

        exMovie.setTitle(request.getTitle());
        exMovie.setDescription(request.getDescription());
        exMovie.setDuration(request.getDuration());
        exMovie.setDirector(request.getDirector());
        exMovie.setTrailerUrl(request.getTrailerUrl());
        exMovie.setPosterUrl(request.getPosterUrl());
        exMovie.setAgeRating(request.getAgeRating());
        exMovie.setStatus(request.getStatus());

        List<Genres> genres = genresRepository.findAllById(request.getGenreIds());
        List<Actors> actors = actorsRepository.findAllById(request.getActorIds());
        exMovie.setGenres(genres);
        exMovie.setActors(actors);
        return moviesRepository.save(exMovie);
    }

    public void deleteMovie(Integer id) {
        if (!moviesRepository.existsById(String.valueOf(id))) {
            throw new RuntimeException("Phim không tồn tại!");
        }
        try {
            moviesRepository.deleteById(String.valueOf(id));
        } catch (Exception e) {
            throw new RuntimeException("Không thể xóa phim này vì đã có Lịch chiếu hoặc Vé đặt!");
        }
    }
}
