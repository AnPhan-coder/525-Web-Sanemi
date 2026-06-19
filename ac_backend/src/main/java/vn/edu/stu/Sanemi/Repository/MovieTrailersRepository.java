package vn.edu.stu.Sanemi.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.stu.Sanemi.Entity.MovieTrailers;

public interface MovieTrailersRepository extends JpaRepository<MovieTrailers, Integer> {
}
