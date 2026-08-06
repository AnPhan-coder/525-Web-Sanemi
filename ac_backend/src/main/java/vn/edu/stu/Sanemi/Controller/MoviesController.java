package vn.edu.stu.Sanemi.Controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import vn.edu.stu.Sanemi.Entity.Movies;
import vn.edu.stu.Sanemi.Repository.MoviesRepository;
import vn.edu.stu.Sanemi.Service.MovieService;
import vn.edu.stu.Sanemi.Service.VoiceoverService;
import vn.edu.stu.Sanemi.dto.request.MoviesRequest;
import vn.edu.stu.Sanemi.dto.response.ApiResponse;
import vn.edu.stu.Sanemi.enums.MoviesStatus;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import vn.edu.stu.Sanemi.Entity.MovieTrailers;
import vn.edu.stu.Sanemi.Repository.MovieTrailersRepository;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // react goi vao
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MoviesController {
    MovieService movieService;
    MoviesRepository moviesRepository;
    MovieTrailersRepository movieTrailersRepository;
    VoiceoverService voiceoverService;

    @GetMapping
    public List<Movies> getAllMovies() {
        return moviesRepository.findAll();
    }

    @GetMapping("/{id}")
    public ApiResponse<Movies> getMovieById(@PathVariable Integer id) {
        return ApiResponse.<Movies>builder()
                .result(moviesRepository.findById(id).orElse(null))
                .build();
    }

    @PostMapping
    public ApiResponse<Movies> createMovie(@RequestBody MoviesRequest request) {
        return ApiResponse.<Movies>builder()
                .result(movieService.createMovie(request))
                .message("Thêm phim thành công")
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<Movies> updateMovie(@PathVariable Integer id, @RequestBody MoviesRequest request) {
        return ApiResponse.<Movies>builder()
                .result(movieService.updateMovie(id, request))
                .message("Cập nhật phim thành công")
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteMovie(@PathVariable Integer id) {
        movieService.deleteMovie(id);
        return ApiResponse.<String>builder()
                .message("Đã ẩn phim")
                .build();
    }

    @GetMapping("/search")
    public ApiResponse<List<Movies>> searchMovies(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) MoviesStatus status,
            @RequestParam(required = false) Integer genreId) {
        String searchKey = (keyword != null && !keyword.isEmpty()) ? "%" + keyword + "%" : null;

        List<Movies> result = moviesRepository.searchMovies(searchKey, status, genreId);

        return ApiResponse.<List<Movies>>builder()
                .result(result)
                .build();
    }

    @PostMapping("/{id}/voiceover")
    public ApiResponse<java.util.Map<String, String>> generateVoiceover(
            @PathVariable Integer id,
            @RequestParam(defaultValue = "vi") String lang) {
        try {
            String newTrailerUrl = voiceoverService.generateVoiceoverForMovie(id, lang);
            
            String languageName;
            switch (lang.toLowerCase()) {
                case "zh": languageName = "Tiếng Trung"; break;
                case "ja": languageName = "Tiếng Nhật"; break;
                case "en": languageName = "Tiếng Anh"; break;
                default: languageName = "Tiếng Việt"; break;
            }

            java.util.Map<String, String> result = java.util.Map.of(
                    "trailerUrl", newTrailerUrl,
                    "languageName", languageName
            );

            return ApiResponse.<java.util.Map<String, String>>builder()
                    .result(result)
                    .message("Tạo thuyết minh tự động thành công")
                    .build();
        } catch (Exception e) {
            return ApiResponse.<java.util.Map<String, String>>builder()
                    .code(500)
                    .message("Lỗi tạo thuyết minh: " + e.getMessage())
                    .build();
        }
    }

    @PostMapping("/{id}/trailers/confirm")
    public ApiResponse<MovieTrailers> confirmTrailer(
            @PathVariable Integer id,
            @RequestParam String url,
            @RequestParam String languageName) {
        try {
            Movies movie = moviesRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Phim không tồn tại"));

            Optional<MovieTrailers> optTrailer = movieTrailersRepository
                    .findByMovieIdAndLanguageTypeAndLanguageName(id, "DUBBED", languageName);

            MovieTrailers trailer;
            if (optTrailer.isPresent()) {
                trailer = optTrailer.get();
                trailer.setTrailerUrl(url);
            } else {
                trailer = MovieTrailers.builder()
                        .movie(movie)
                        .trailerUrl(url)
                        .languageType("DUBBED")
                        .languageName(languageName)
                        .build();
            }

            MovieTrailers saved = movieTrailersRepository.save(trailer);
            return ApiResponse.<MovieTrailers>builder()
                    .result(saved)
                    .message("Lưu bản thuyết minh thành công")
                    .build();
        } catch (Exception e) {
            return ApiResponse.<MovieTrailers>builder()
                    .code(500)
                    .message("Lỗi lưu thuyết minh: " + e.getMessage())
                    .build();
        }
    }

    @GetMapping("/{id}/trailers")
    public ApiResponse<List<MovieTrailers>> getMovieTrailers(@PathVariable Integer id) {
        Movies movie = moviesRepository.findById(id).orElse(null);
        if (movie == null) {
            return ApiResponse.<List<MovieTrailers>>builder()
                    .code(404)
                    .message("Phim không tồn tại")
                    .build();
        }

        List<MovieTrailers> list = new ArrayList<>(movieTrailersRepository.findByMovieId(id));

        // Add original trailer as a virtual item at the beginning
        if (movie.getTrailerUrl() != null && !movie.getTrailerUrl().trim().isEmpty()) {
            MovieTrailers original = MovieTrailers.builder()
                    .id(-1)
                    .movie(movie)
                    .trailerUrl(movie.getTrailerUrl())
                    .languageType("DUBBED")
                    .languageName("Bản gốc")
                    .build();
            list.add(0, original);
        }

        return ApiResponse.<List<MovieTrailers>>builder()
                .result(list)
                .build();
    }
}
