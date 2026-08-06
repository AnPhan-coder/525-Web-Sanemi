package vn.edu.stu.Sanemi.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.stu.Sanemi.Entity.MovieTrailers;

import java.util.List;
import java.util.Optional;

public interface MovieTrailersRepository extends JpaRepository<MovieTrailers, Integer> {
    List<MovieTrailers> findByMovieId(Integer movieId);
    Optional<MovieTrailers> findByMovieIdAndLanguageTypeAndLanguageName(Integer movieId, String languageType, String languageName);
}
