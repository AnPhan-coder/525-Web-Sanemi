package vn.edu.stu.Sanemi.Controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;
import vn.edu.stu.Sanemi.Entity.Genres;
import vn.edu.stu.Sanemi.Repository.GenresRepository;

import java.util.List;

@RestController
@RequestMapping("/api/genres")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GenresController {
    GenresRepository genresRepository;

    @GetMapping
    public List<Genres> getAllGenres() {
        return genresRepository.findAll();
    }

    @PostMapping
    public Genres createGenres(@RequestBody Genres genres) {
        return  genresRepository.save(genres);
    }
}


