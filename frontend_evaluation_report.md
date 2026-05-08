# Báo cáo Đánh giá Mã nguồn Frontend (React)

Dựa trên quá trình kiểm tra các thư mục và file trong `ac_frontend/src`, đây là báo cáo đánh giá về tình trạng lặp logic, cấu trúc và những phần cần cải thiện:

## 1. Sự thiếu đồng bộ trong việc gọi API (Vấn đề lớn nhất)
Hệ thống hiện tại đang sử dụng lẫn lộn giữa cấu hình `axiosClient` chuẩn và gọi `axios` trực tiếp.

* **Sử dụng `axiosClient` chuẩn:** Các file như `ShowtimeForm.jsx`, `RegisterPage.jsx`, `PaymentPage.jsx`, `MovieForm.jsx`, `ManageUsers.jsx`, `LoginPage.jsx`... đều import `axiosClient` từ `api/axiosClient.js`. Điều này rất tốt vì `axiosClient` đã được cấu hình sẵn `baseURL` (`http://localhost:8080/api`) và tự động đính kèm `Authorization` token.
* **Hardcode URL với `axios` gốc (Lặp code nghiêm trọng):** Rất nhiều file khác như `HomePage.jsx`, `MovieDetail.jsx`, `MoviesPage.jsx`, `ManageRooms.jsx`, `ManageMovie.jsx`, `SeatDesigner.jsx`, `RoomForm.jsx`, `ShowtimePage.jsx`, `hooks/useBooking.js` lại import trực tiếp `axios` gốc. 
  * Hậu quả: Các file này đang lặp lại logic hardcode URL như `axios.get("http://localhost:8080/api/...")` hoặc `axios.post(...)`. Điều này vi phạm nguyên tắc DRY (Don't Repeat Yourself) và gây khó khăn lớn nếu sau này server thay đổi domain hoặc port.

## 2. Xử lý Trạng thái (Loading, Error) không nhất quán
Dự án có cung cấp một hook rất hữu ích là `useApiCall` (nằm trong `hooks/useApiCall.js`) để chuẩn hóa việc set loading, catch error và hiển thị toast notification. Tuy nhiên, nó không được sử dụng triệt để:
* Một số trang dùng: `MovieForm`, `HomePage`, `ShowtimeForm`, `ManageMovie`, `ManageRooms`...
* Một nửa số trang khác lại tự viết `try/catch` thủ công: `SeatDesigner`, `RoomForm`, `ForgotPasswordPage`, `RegisterPage`, `PaymentPage`, `MyInfo`, `MyBookings`... Điều này làm rác component và khiến trải nghiệm hiển thị lỗi (Toast) không đồng nhất.

## 3. Lặp logic UI / Component chưa tái sử dụng tốt
* **Logic Render Ghế (Seat):** Cả hai file `BookingSeat.jsx` và `SeatDesigner.jsx` đều chứa những đoạn code vẽ SVG (ghế thường, VIP, Couple) giống hệt nhau. Đây là logic có thể tách ra thành 1 component dùng chung (ví dụ: `SeatIcon.jsx` hoặc `SeatItem.jsx`) để tránh lặp lại hàng trăm dòng code SVG.
* **Form Logic:** Các file như `MovieForm.jsx`, `ShowtimeForm.jsx`, `RoomForm.jsx` có cấu trúc HTML form và xử lý input onChange khá tương đồng, một số khối layout form bị lặp lại.
* **Logic Upload Ảnh:** Nằm cứng trong `MovieForm`, nếu sau này `Room` hay `User` cần upload ảnh thì sẽ lại phải copy/paste.

## 4. Vi phạm kiến trúc "Tách biệt API ra khỏi UI"
Theo quy tắc chuẩn của một dự án Senior Frontend: *“Separate API logic into /services. No fetch calls inside UI components directly.”*
Hiện tại, **100% các file trong mục `pages/` đang trực tiếp thực hiện gọi API** bên trong `useEffect` hoặc các hàm handle event.
* Cấu trúc thư mục hiện tại không có thư mục `services/`.
* Cần phải tách toàn bộ logic `axios` ra các file service riêng rẽ (ví dụ: `movieService.js`, `bookingService.js`, `authService.js`) và component chỉ việc gọi các hàm service này.

## 5. Tình trạng component quá lớn (Fat Components)
Theo quy tắc *“No inline large JSX blocks (>100 lines)”*, các file sau đang chứa logic UI quá lớn và cần được tách nhỏ (chia thành các sub-components):
* `MovieForm.jsx` (gần 400 dòng)
* `SeatDesigner.jsx` (~200 dòng)
* `ManageShowtimes.jsx`, `ManageUsers.jsx`, `HomePage.jsx`

## KẾT LUẬN & ĐỀ XUẤT HÀNH ĐỘNG
1. **Refactor API Client:** Tìm và thay thế toàn bộ chữ `axios` thành `axiosClient` trên toàn dự án, loại bỏ các đoạn hardcode `http://localhost:8080/api/`.
2. **Tạo tầng Services:** Di chuyển toàn bộ lời gọi `axiosClient` từ trong `pages` ra một thư mục `services/` mới.
3. **Đồng bộ hóa hook `useApiCall`:** Áp dụng `useApiCall` cho tất cả các request API để có trải nghiệm UI/UX loading và error nhất quán.
4. **Tách Component:** Gom phần vẽ SVG ghế của `SeatDesigner` và `BookingSeat` thành một component duy nhất. Tách nhỏ các form component.
