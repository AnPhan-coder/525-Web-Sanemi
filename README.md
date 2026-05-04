# 525_Web_Sanemi - Bài luận văn tốt nghiệp - Nhóm 525

# SANEMI - Hệ thống Đặt vé Xem phim Online

![alt text](image.png)

## 📝 Giới thiệu

**SANEMI** là một ứng dụng web Fullstack cho phép người dùng xem lịch chiếu, đặt vé xem phim trực tuyến và chọn ghế theo thời gian thực. Hệ thống bao gồm trang dành cho Người dùng (Client) và trang Quản trị (Admin Dashboard) để quản lý phim, suất chiếu và doanh thu.

Dự án là bài luận văn tốt nghiệp của Nhóm 525, được xây dựng để áp dụng các công nghệ Web hiện đại.

## Công nghệ sử dụng

### Frontend

- **ReactJS (Vite):** Xây dựng giao diện người dùng.
- **Tailwind CSS:** Styling giao diện hiện đại, Responsive.
- **Axios:** Xử lý gọi API.
- **React Router DOM:** Điều hướng trang.
- **Lucide React:** Icon set.

### Backend

- **Java Spring Boot:** Xây dựng RESTful API.
- **Spring Security:** Xác thực và phân quyền (JWT).
- **Hibernate / JPA:** Tương tác với cơ sở dữ liệu.
- **MySQL:** Cơ sở dữ liệu chính.

### Tools & Others

- **Git & GitHub:** Quản lý mã nguồn.
- **Postman:** Test API.
- **VNPay:** Tích hợp cổng thanh toán giả lập.

## Tính năng chính

### Dành cho Người dùng (User)

- **Tra cứu phim:** Xem phim đang chiếu, sắp chiếu, tìm kiếm phim theo tên.
- **Xem chi tiết:** Xem thông tin phim, trailer, thời lượng, thể loại.
- **Đặt vé:**
  - Xem lịch chiếu theo ngày.
  - Chọn ghế trực quan (Ghế thường, VIP, Couple).
  - Tính tổng tiền tự động.
- **Thanh toán:** Tích hợp thanh toán online.
- **Hồ sơ cá nhân:** Xem lịch sử đặt vé, chỉnh sửa thông tin cá nhân.

### Dành cho Quản trị viên (Admin)

- **Quản lý Phim:** Thêm, sửa, xóa, cập nhật trạng thái phim.
- **Quản lý Lịch chiếu:** Lên lịch chiếu cho phim.
- **Quản lý Phòng chiếu:**
  - **Thiết kế sơ đồ ghế (Room Designer):** Công cụ kéo thả để thiết lập bố cục ghế (Lối đi, ghế đôi, ghế VIP).
- **Quản lý Người dùng:** Xem danh sách, khóa/mở khóa tài khoản, phân quyền.
- **Thống kê doanh thu:** Xem thống kê doanh thu, số lượng vé bán ra.
