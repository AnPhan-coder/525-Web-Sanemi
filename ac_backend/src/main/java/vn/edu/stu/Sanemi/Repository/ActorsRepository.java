package vn.edu.stu.Sanemi.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.stu.Sanemi.Entity.Actors;

import java.util.List;

public interface ActorsRepository extends JpaRepository<Actors, Integer> {
    @Override
    List<Actors> findAllById(Iterable<Integer> integers);
}


