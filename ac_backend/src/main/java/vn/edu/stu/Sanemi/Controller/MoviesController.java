package vn.edu.stu.Sanemi.Controller;


import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import vn.edu.stu.Sanemi.Entity.Movies;
import vn.edu.stu.Sanemi.Repository.MoviesRepository;
import vn.edu.stu.Sanemi.Service.MovieService;
import vn.edu.stu.Sanemi.dto.request.MoviesRequest;
import vn.edu.stu.Sanemi.dto.response.ApiResponse;
import vn.edu.stu.Sanemi.enums.MoviesStatus;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // react goi vao
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MoviesController {
    MovieService movieService;
    MoviesRepository moviesRepository;

    @GetMapping
    public List<Movies> getAllMovies(){
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
            @RequestParam(required = false) Integer genreId
    ) {
        String searchKey = (keyword != null && !keyword.isEmpty()) ? "%" + keyword + "%" : null;

        List<Movies> result = moviesRepository.searchMovies(searchKey, status, genreId);

        return ApiResponse.<List<Movies>>builder()
                .result(result)
                .build();
    }
}


