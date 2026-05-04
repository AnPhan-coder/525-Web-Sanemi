package vn.edu.stu.Sanemi.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.stu.Sanemi.Entity.Cinemas;

import java.util.Optional;

public interface CinemasRepository extends JpaRepository<Cinemas, Integer> {
}


