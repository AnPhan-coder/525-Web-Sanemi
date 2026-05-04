package vn.edu.stu.Sanemi.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.stu.Sanemi.Entity.Bookings;
import vn.edu.stu.Sanemi.Entity.Users;
import vn.edu.stu.Sanemi.Repository.BookingsRepository;
import vn.edu.stu.Sanemi.Repository.UsersRepository;
import vn.edu.stu.Sanemi.dto.request.UserUpdateRequest;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {

    UsersRepository usersRepository;
    PasswordEncoder passwordEncoder;
    BookingsRepository bookingRepository;

    public List<Users> getAllUsers() {
        return usersRepository.findAll();
    }

    @Transactional
    public String toggleUserStatus(Integer id) {
        Users user = usersRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        boolean newStatus = user.getIsActive() != null && !user.getIsActive();
        user.setIsActive(newStatus);

        usersRepository.save(user);

        return newStatus ? "Đã mở khóa tài khoản!" : "Đã khóa tài khoản!";
    }

    @Transactional
    public Users updateUser(Integer id, UserUpdateRequest request) {
        Users user = usersRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        if (request.getName() != null && !request.getName().isEmpty()) {
            user.setName(request.getName());
        }

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return usersRepository.save(user);
    }

    @Transactional
    public Users updateUserRole(Integer id, String newRole) {
        Users user = usersRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        user.setRole(newRole);
        return usersRepository.save(user);
    }

    public List<Bookings> getUserBookings(Integer userId) {
        return bookingRepository.findByUserId(userId);
    }
}

