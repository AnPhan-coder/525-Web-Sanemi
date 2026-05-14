package vn.edu.stu.Sanemi.Service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Map;

@Service
    @RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UploadService {

    static final long MAX_VIDEO_SIZE = 500L * 1024 * 1024; // 500MB

    Cloudinary cloudinary;

    // Upload ảnh poster, thumbnail, v.v. — lưu vào folder "sanemi/images"
    public String saveFile(MultipartFile file) {
        if (file.isEmpty()) throw new RuntimeException("File không được rỗng");
        return uploadViaTemp(file, "sanemi/images", "image");
    }

    // Upload trailer video — lưu vào folder "sanemi/trailers"
    public String saveTrailer(MultipartFile file) {
        validateVideoFile(file);
        return uploadViaTemp(file, "sanemi/trailers", "video");
    }

    /**
     * Cloudinary SDK v1.x không nhận InputStream.
     * Ghi MultipartFile ra file tạm trên đĩa → upload → xóa file tạm.
     */
    @SuppressWarnings("unchecked")
    private String uploadViaTemp(MultipartFile file, String folder, String resourceType) {
        File tempFile = null;
        try {
            // Tạo file tạm với đuôi giữ nguyên để Cloudinary nhận diện đúng định dạng
            String originalName = file.getOriginalFilename();
            String suffix = (originalName != null && originalName.contains("."))
                    ? originalName.substring(originalName.lastIndexOf('.'))
                    : "";
            tempFile = File.createTempFile("upload_", suffix);
            file.transferTo(tempFile);

            Map<Object, Object> options = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", resourceType
            );
            Map<?, ?> result = cloudinary.uploader().upload(tempFile, options);
            return (String) result.get("secure_url");
        } catch (IOException ex) {
            throw new RuntimeException("Lỗi upload lên Cloudinary: " + ex.getMessage());
        } finally {
            // Đảm bảo xóa file tạm dù có lỗi hay không
            if (tempFile != null && tempFile.exists()) {
                tempFile.delete();
            }
        }
    }

    private void validateVideoFile(MultipartFile file) {
        if (file.isEmpty()) throw new RuntimeException("File không được rỗng");
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("video/")) {
            throw new RuntimeException("Chỉ chấp nhận file video (mp4, webm, ...)");
        }
        if (file.getSize() > MAX_VIDEO_SIZE) {
            throw new RuntimeException("File video không được vượt quá 500MB");
        }
    }
}

