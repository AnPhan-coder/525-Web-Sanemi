package vn.edu.stu.Sanemi.Repository;

import org.apache.catalina.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.stu.Sanemi.Entity.Users;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UsersRepository extends JpaRepository<Users, Integer> {
    boolean existsByEmail(String email);

    Optional<Users> findByEmail(String email);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
