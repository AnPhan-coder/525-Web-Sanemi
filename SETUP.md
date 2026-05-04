# 📋 Hướng dẫn Cấu hình Môi trường

## Backend Configuration

### 1. Setup Database

```bash
# Tạo database
mysql -u root -p
CREATE DATABASE dat_ve_xem_phim;
```

### 2. Cấu hình Application Properties

```bash
# Copy file example
cd ac_backend/src/main/resources
cp application.yaml.example application.yaml

# Chỉnh sửa application.yaml với thông tin của bạn
```

**Thông tin cần cấu hình:**

- **Database**: Thay `your_database_password` bằng password MySQL của bạn
- **Gmail SMTP**:
  - Dùng Gmail App Password (không phải mật khẩu chính)
  - Cách tạo: Google Account → Security → App passwords → chọn Mail & Windows
- **Google OAuth**:
  - Lấy từ Google Cloud Console
  - Tạo OAuth 2.0 credentials
- **JWT Secret**: Tạo random string an toàn (tối thiểu 64 ký tự)
- **VNPay**: Cấu hình tài khoản merchant test của bạn

### 3. Chạy Backend

```bash
cd ac_backend
mvn clean install
mvn spring-boot:run
```

## Frontend Configuration

```bash
cd ac_frontend
npm install
npm run dev
```

## Lưu ý Bảo mật ⚠️

- **KHÔNG** commit file `application.yaml` lên Git
- Luôn dùng `.gitignore` để bảo vệ credentials
- Sử dụng environment variables trong production
- Giữ bí mật các API keys và passwords
