package vn.edu.stu.Sanemi.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.stu.Sanemi.Entity.*;
import vn.edu.stu.Sanemi.Repository.*;
import vn.edu.stu.Sanemi.dto.request.BookingsRequest;
import vn.edu.stu.Sanemi.dto.response.SeatResponse;
import vn.edu.stu.Sanemi.enums.BookingStatus;
import vn.edu.stu.Sanemi.enums.SeatType;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookingService {
    BookingsRepository bookingsRepository;
    BookingDetailsRepository bookingDetailRepository;
    SeatsRepository seatsRepository;
    ShowtimesRepository showtimesRepository;
    UsersRepository usersRepository;
    EmailService emailService;

    public List<SeatResponse> getSeatMapByShowtime(Integer showtimeId) {
        Showtimes showtime = showtimesRepository.findById(showtimeId)
                .orElseThrow(() -> new RuntimeException("Suất chiếu không tồn tại"));

        List<Seats> allSeats = seatsRepository.findByRoomId(showtime.getRoom().getId());

        List<Integer> bookedSeatIds = bookingDetailRepository.findBookedSeatIdsByShowtimeId(showtimeId);

        return allSeats.stream().map(seat -> {
            boolean isBooked = bookedSeatIds.contains(seat.getId());
            double price = calculateTicketPrice(showtime, seat);

            return SeatResponse.builder()
                    .id(seat.getId())
                    .code(seat.getSeatCode())
                    .type(seat.getType())
                    .rowIndex(seat.getRowIndex())
                    .colIndex(seat.getColIndex())
                    .price(price)
                    .isBooked(isBooked)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(rollbackFor = Exception.class)
    public Bookings createBooking(BookingsRequest request) {
        Users user = usersRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
        Showtimes showtime = showtimesRepository.findById(request.getShowtimeId())
                .orElseThrow(() -> new RuntimeException("Suất chiếu không tồn tại"));

        List<Integer> bookedSeatIds = bookingDetailRepository.findBookedSeatIdsByShowtimeId(showtime.getId());
        List<Seats> selectedSeats = seatsRepository.findAllById(request.getSeatIds());

        if (selectedSeats.size() != request.getSeatIds().size()) {
            throw new RuntimeException("Dữ liệu ghế không hợp lệ");
        }

        double totalPrice = 0;

        for (Seats seat : selectedSeats) {
            if (bookedSeatIds.contains(seat.getId())) {
                throw new RuntimeException("Ghế " + seat.getSeatCode() + " vừa được khách khác đặt. Vui lòng chọn lại!");
            }
            totalPrice += calculateTicketPrice(showtime, seat);
        }

        Bookings booking = Bookings.builder()
                .user(user)
                .showtime(showtime)
                .bookingTime(LocalDateTime.now())
                .status(BookingStatus.pending)
                .totalPrice(totalPrice)
                .build();

        Bookings savedBooking = bookingsRepository.save(booking);
        List<BookingDetails> detailsList = new ArrayList<>();

        for (Seats seat : selectedSeats) {
            BookingDetails detail = BookingDetails.builder()
                    .booking(savedBooking)
                    .seat(seat)
                    .price(calculateTicketPrice(showtime, seat))
                    .build();
            bookingDetailRepository.save(detail);
            detailsList.add(detail);
        }
        savedBooking.setBookingDetails(detailsList);
        return savedBooking;
    }

    double calculateTicketPrice(Showtimes showtime, Seats seat) {
        double basePrice = showtime.getBasePrice();

        if (seat.getType() == SeatType.VIP) {
            return basePrice + 10000;
        } else if (seat.getType() == SeatType.COUPLE) {
            return basePrice * 2;
        }
        return basePrice;
    }

    public void processPayment(Integer bookingId) {
        Bookings booking = bookingsRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));

        if (booking.getStatus() == BookingStatus.paid) {
            throw new RuntimeException("Đơn hàng này đã được thanh toán rồi!");
        }

        booking.setStatus(BookingStatus.paid);
        bookingsRepository.save(booking);

        try {
            sendTicketEmail(booking);
        } catch (Exception e) {
            System.err.println("Lỗi gửi mail vé: " + e.getMessage());
        }
    }

    public List<Bookings> getMyBookings(Integer userId) {
        return bookingsRepository.findByUserIdOrderByBookingTimeDesc(userId);
    }

    void sendTicketEmail(Bookings booking) {
        try {
            String userEmail = booking.getUser().getEmail();
            String movieTitle = booking.getShowtime().getMovie().getTitle();
            String roomName = booking.getShowtime().getRoom().getName();

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm - dd/MM/yyyy");
            String showTime = booking.getShowtime().getStartTime().format(formatter);

            String seatCodes = booking.getBookingDetails().stream()
                    .map(detail -> detail.getSeat().getSeatCode())
                    .collect(Collectors.joining(", "));

            Locale localeVN = new Locale("vi", "VN");
            NumberFormat currencyVN = NumberFormat.getCurrencyInstance(localeVN);
            String formattedPrice = currencyVN.format(booking.getTotalPrice());

            String qrContent = String.format("Mã Vé: %d | Phim: %s | Rạp: %s | Ghế: %s | Suất: %s",
                    booking.getId(), movieTitle, roomName, seatCodes, showTime);

            String encodedQrContent = URLEncoder.encode(qrContent, StandardCharsets.UTF_8);
            String qrImageUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodedQrContent;

            String subject = "🎟️ Vé điện tử Sanemi: " + movieTitle;

            String content = String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                        .email-container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                        .header { background-color: #d32f2f; color: white; padding: 25px; text-align: center; }
                        .header h2 { margin: 0; font-size: 24px; letter-spacing: 1px; }
                        .content { padding: 30px; color: #333333; }
                        .movie-title { font-size: 22px; font-weight: bold; color: #d32f2f; margin-bottom: 5px; }
                        .cinema-name { font-size: 16px; color: #666; margin-bottom: 20px; }
                        .info-table { width: 100%%; border-collapse: collapse; margin-top: 10px; }
                        .info-table td { padding: 12px 5px; border-bottom: 1px dashed #ddd; vertical-align: top; }
                        .label { font-weight: bold; color: #555; width: 100px; }
                        .value { font-weight: bold; color: #000; font-size: 15px; }
                        .qr-section { text-align: center; margin-top: 25px; padding-top: 20px; border-top: 2px solid #f0f0f0; }
                        .qr-img { border: 5px solid #fff; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                        .footer { background-color: #333; color: #aaa; text-align: center; padding: 15px; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <h2>VÉ ĐIỆN TỬ Sanemi</h2>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>%s</strong>,</p>
                            <p>Cảm ơn bạn đã đặt vé. Đây là vé vào cửa của bạn:</p>
                            
                            <div class="movie-title">%s</div>
                            <div class="cinema-name">%s</div>
                            
                            <table class="info-table">
                                <tr>
                                    <td class="label">Mã vé:</td>
                                    <td class="value">#%d</td>
                                </tr>
                                <tr>
                                    <td class="label">Suất chiếu:</td>
                                    <td class="value">%s</td>
                                </tr>
                                <tr>
                                    <td class="label">Ghế:</td>
                                    <td class="value" style="color: #d32f2f;">%s</td>
                                </tr>
                                <tr>
                                    <td class="label">Tổng tiền:</td>
                                    <td class="value">%s</td>
                                </tr>
                            </table>

                            <div class="qr-section">
                                <p style="margin-bottom: 10px; font-size: 14px; color: #777;">Quét mã này tại quầy soát vé</p>
                                <img src="%s" alt="QR Code" width="180" height="180" class="qr-img" />
                            </div>
                        </div>
                        <div class="footer">
                            Vui lòng đến trước giờ chiếu 15 phút.<br>
                            Chúc bạn xem phim vui vẻ!<br>
                            Sanemi Team
                        </div>
                    </div>
                </body>
                </html>
                """,
                    booking.getUser().getName(),
                    movieTitle,
                    roomName,
                    booking.getId(),
                    showTime,
                    seatCodes,
                    formattedPrice,
                    qrImageUrl
            );

            emailService.sendEmail(userEmail, subject, content);

        } catch (Exception e) {
            System.err.println("Lỗi tạo nội dung email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Transactional
    public void cancelBooking(Integer bookingId, String email) {
        Bookings booking = bookingsRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));

        if (!booking.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Bạn không có quyền hủy đơn hàng này!");
        }

        if (booking.getStatus() != BookingStatus.pending) {
            throw new RuntimeException("Không thể hủy vé đã thanh toán hoặc đã bị hủy trước đó.");
        }

        bookingsRepository.delete(booking);
    }

    public Bookings getBookingById(Integer id, String email) {
        Bookings booking = bookingsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));

        if (!booking.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Bạn không có quyền xem thông tin vé này!");
        }

        return booking;
    }

    public List<Bookings> getAllBookings() {
        return bookingsRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "bookingTime"));
    }

    @Transactional
    public void deleteBooking(Integer id) {
        if (!bookingsRepository.existsById(id)) {
            throw new RuntimeException("Vé không tồn tại!");
        }
        bookingsRepository.deleteById(id);
    }
}


