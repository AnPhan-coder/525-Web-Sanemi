package vn.edu.stu.Sanemi.Controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vn.edu.stu.Sanemi.Entity.*;
import vn.edu.stu.Sanemi.Repository.*;
import vn.edu.stu.Sanemi.Service.BookingService;
import vn.edu.stu.Sanemi.Service.VNPayService;
import vn.edu.stu.Sanemi.dto.request.AddSnacksRequest;
import vn.edu.stu.Sanemi.dto.request.BookingsRequest;
import vn.edu.stu.Sanemi.dto.response.ApiResponse;
import vn.edu.stu.Sanemi.dto.response.SeatResponse;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // react goi vao
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookingController {
    BookingService bookingService;
    VNPayService vnPayService;
    @GetMapping("/{id}")
    public ApiResponse<Bookings> getBookingDetail(@PathVariable Integer id) {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        Bookings booking = bookingService.getBookingById(id, currentEmail);

        return ApiResponse.<Bookings>builder()
                .result(booking)
                .build();
    }

    @GetMapping("/seats")
    public ApiResponse<List<SeatResponse>> getSeatMap(@RequestParam Integer showtimeId) {
        return ApiResponse.<List<SeatResponse>>builder()
                .result(bookingService.getSeatMapByShowtime(showtimeId))
                .build();
    }

    @PostMapping
    public ApiResponse<Bookings> createBooking(@RequestBody BookingsRequest request) {
        return ApiResponse.<Bookings>builder()
                .result(bookingService.createBooking(request))
                .message("Đặt vé thành công! Vui lòng thanh toán.")
                .build();
    }

    @PostMapping("/{id}/pay")
    public ApiResponse<String> payBooking(@PathVariable Integer id) {
        bookingService.processPayment(id);
        return ApiResponse.<String>builder()
                .message("Thanh toán thành công! Vé đã được gửi tới email.")
                .build();
    }

    // Lưu snack vào booking trước khi thanh toán
    @PostMapping("/{id}/snacks")
    public ApiResponse<Bookings> addSnacks(@PathVariable Integer id,
                                           @RequestBody AddSnacksRequest request) {
        return ApiResponse.<Bookings>builder()
                .result(bookingService.addSnacks(id, request))
                .message("Đã thêm bắp nước vào đơn hàng")
                .build();
    }

    @GetMapping("/my-bookings")
    public ApiResponse<List<Bookings>> getMyBookings(@RequestParam Integer userId) {
        return ApiResponse.<List<Bookings>>builder()
                .result(bookingService.getMyBookings(userId))
                .build();
    }

    @PostMapping("/cancel/{id}")
    public ApiResponse<String> cancelBooking(@PathVariable Integer id) {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        bookingService.cancelBooking(id, currentEmail);
        return ApiResponse.<String>builder()
                .message("Đã hủy giữ ghế thành công.")
                .build();
    }
    @PostMapping("/payment/vnpay/{id}")
    public ApiResponse<String> createVNPayUrl(@PathVariable Integer id, HttpServletRequest request) {
        String url = vnPayService.createPaymentUrl(id, request);
        return ApiResponse.<String>builder()
                .result(url)
                .message("Tạo link VNPay thành công")
                .build();
    }
    @GetMapping("/payment/vnpay-callback")
    public ApiResponse<Integer> vnpayCallback(HttpServletRequest request) {
        int status = vnPayService.orderReturn(request);
        return ApiResponse.<Integer>builder()
                .result(status)
                .message(status == 1 ? "Thanh toán thành công" : "Thanh toán thất bại")
                .build();
    }
}



