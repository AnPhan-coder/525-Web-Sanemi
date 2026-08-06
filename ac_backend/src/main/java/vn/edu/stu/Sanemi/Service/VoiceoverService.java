package vn.edu.stu.Sanemi.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import vn.edu.stu.Sanemi.Entity.Movies;
import vn.edu.stu.Sanemi.Entity.MovieTrailers;
import vn.edu.stu.Sanemi.Repository.MoviesRepository;
import vn.edu.stu.Sanemi.Repository.MovieTrailersRepository;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VoiceoverService {

    MoviesRepository moviesRepository;
    MovieTrailersRepository movieTrailersRepository;
    GeminiService geminiService;
    TTSService ttsService;
    VideoProcessingService videoProcessingService;
    UploadService uploadService;

    public String generateVoiceoverForMovie(Integer movieId, String lang) throws Exception {
        Movies movie = moviesRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Phim không tồn tại với ID: " + movieId));

        if (movie.getTrailerUrl() == null || movie.getTrailerUrl().trim().isEmpty()) {
            throw new RuntimeException("Phim này chưa có trailer gốc để thuyết minh. Vui lòng tải trailer lên trước.");
        }

        // Map language code to display name and Google TTS language code
        String languageName;
        String langCode;
        switch (lang.toLowerCase()) {
            case "zh":
                languageName = "Tiếng Trung";
                langCode = "zh-CN";
                break;
            case "ja":
                languageName = "Tiếng Nhật";
                langCode = "ja";
                break;
            case "en":
                languageName = "Tiếng Anh";
                langCode = "en";
                break;
            default:
                languageName = "Tiếng Việt";
                langCode = "vi";
                break;
        }

        // 1. Generate Voiceover script via Gemini
        String script = geminiService.generateVoiceoverScript(movie.getTitle(), movie.getDescription(), langCode);
        System.out.println("Generated Voiceover Script (" + languageName + "): " + script);

        File tempOriginalVideo = null;
        File tempVoiceoverMp3 = null;
        File tempMergedVideo = null;

        try {
            // 2. Convert generated script into local temp mp3 file
            tempVoiceoverMp3 = File.createTempFile("voiceover_", ".mp3");
            ttsService.generateVoiceFromText(script, tempVoiceoverMp3.getAbsolutePath(), langCode);

            // 3. Download the original trailer locally to avoid FFmpeg read latency/network issues
            tempOriginalVideo = File.createTempFile("original_trailer_", ".mp4");
            downloadFile(movie.getTrailerUrl(), tempOriginalVideo);

            // 4. Set up local temp file path for the mixed video output
            tempMergedVideo = File.createTempFile("merged_trailer_", ".mp4");

            // 5. Merge original video with the voiceover (perform audio ducking)
            videoProcessingService.mergeVoiceover(
                    tempOriginalVideo.getAbsolutePath(),
                    tempVoiceoverMp3.getAbsolutePath(),
                    tempMergedVideo.getAbsolutePath()
            );

            // 6. Upload mixed trailer to Cloudinary and return URL
            return uploadService.uploadLocalFile(tempMergedVideo, "sanemi/trailers", "video");
        } finally {
            // Clean up temporary files
            deleteTempFile(tempOriginalVideo);
            deleteTempFile(tempVoiceoverMp3);
            deleteTempFile(tempMergedVideo);
        }
    }

    private void downloadFile(String fileUrl, File destination) throws Exception {
        try (InputStream in = new URL(fileUrl).openStream();
             FileOutputStream out = new FileOutputStream(destination)) {
            byte[] buffer = new byte[4096];
            int bytesRead;
            while ((bytesRead = in.read(buffer, 0, 4096)) != -1) {
                out.write(buffer, 0, bytesRead);
            }
        }
    }

    private void deleteTempFile(File file) {
        if (file != null && file.exists()) {
            file.delete();
        }
    }
}
