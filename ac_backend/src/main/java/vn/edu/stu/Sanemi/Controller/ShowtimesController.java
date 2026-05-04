package vn.edu.stu.Sanemi.Controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;
import vn.edu.stu.Sanemi.Entity.Showtimes;
import vn.edu.stu.Sanemi.Repository.ShowtimesRepository;

import java.util.List;

@RestController
@RequestMapping("/api/showtimes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // react goi vao
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ShowtimesController {
    ShowtimesRepository showtimesRepository;

    @GetMapping
    public List<Showtimes> findAll() {
        return showtimesRepository.findAll();
    }

    @GetMapping("/movie")
    public List<Showtimes> getShowtimeByMovie(@RequestParam Integer movieId) {
        return showtimesRepository.findByMovieId(movieId);
    }
    @GetMapping("/{id}")
    public Showtimes getShowtimeById(@PathVariable Integer id) {
        return showtimesRepository.findById(id).orElse(null);
    }
}


