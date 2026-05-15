package vn.edu.stu.Sanemi.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.stu.Sanemi.Service.UploadService;
import vn.edu.stu.Sanemi.dto.response.ApiResponse;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class UploadController {

    private final UploadService uploadService;

    @PostMapping
    public ApiResponse<String> uploadFile(@RequestParam("file") MultipartFile file) {
        return ApiResponse.<String>builder()
                .result(uploadService.saveFile(file))
                .message("Upload thành công")
                .build();
    }

    @PostMapping("/trailer")
    public ApiResponse<String> uploadTrailer(@RequestParam("file") MultipartFile file) {
        return ApiResponse.<String>builder()
                .result(uploadService.saveTrailer(file))
                .message("Upload trailer thành công")
                .build();
    }
}
