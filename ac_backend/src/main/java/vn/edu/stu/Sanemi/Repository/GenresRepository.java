package vn.edu.stu.Sanemi.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.stu.Sanemi.Entity.Genres;

import java.util.List;

public interface GenresRepository extends JpaRepository<Genres, Integer> {
    @Override
    List<Genres> findAllById(Iterable<Integer> integers);
}


