package vn.edu.stu.Sanemi.Entity;

import jakarta.persistence.*;
import lombok.*;
import vn.edu.stu.Sanemi.enums.MembershipLevel;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@Table(name = "users")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    String name;

    @Column(unique = true, nullable = false)
    String email;

    @Column(nullable = false)
    String password;

    String role;

    @Column(name = "birth_date")
    LocalDate birthDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "membership_level", columnDefinition = "varchar(255) default 'NORMAL'")
    @Builder.Default
    MembershipLevel membershipLevel = MembershipLevel.NORMAL;

    @Column(name = "total_spent", columnDefinition = "double default 0.0")
    @Builder.Default
    Double totalSpent = 0.0;

    String gender;

    @Column(columnDefinition = "boolean default true")
    @Builder.Default
    Boolean isActive = true;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @Column(name = "otp_code")
    String otpCode;

    @Column(name = "otp_expiration")
    LocalDateTime otpExpiration;

}
