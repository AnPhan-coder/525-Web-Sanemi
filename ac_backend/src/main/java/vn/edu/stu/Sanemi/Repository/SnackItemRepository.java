package vn.edu.stu.Sanemi.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.stu.Sanemi.Entity.SnackItems;

import java.util.List;

@Repository
public interface SnackItemRepository extends JpaRepository<SnackItems, Integer> {
    List<SnackItems> findByAvailableTrue();
}
